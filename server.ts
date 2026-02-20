import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("pc_tracker.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS pcs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'available' -- 'available' or 'assigned'
  );

  CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pc_id INTEGER NOT NULL,
    person_name TEXT NOT NULL,
    person_type TEXT NOT NULL, -- 'student' or 'teacher'
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    returned_at DATETIME,
    FOREIGN KEY (pc_id) REFERENCES pcs(id)
  );
`);

// Seed some initial PCs if none exist
const pcCount = db.prepare("SELECT COUNT(*) as count FROM pcs").get() as { count: number };
if (pcCount.count === 0) {
  const insertPC = db.prepare("INSERT INTO pcs (name) VALUES (?)");
  ['PC-01', 'PC-02', 'PC-03', 'PC-04', 'PC-05', 'MacBook-Pro-01', 'Surface-01'].forEach(name => {
    insertPC.run(name);
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/pcs", (req, res) => {
    const pcs = db.prepare(`
      SELECT 
        p.id, 
        p.name, 
        p.status, 
        a.person_name, 
        a.person_type, 
        a.id as assignment_id
      FROM pcs p
      LEFT JOIN assignments a ON p.id = a.pc_id AND a.returned_at IS NULL
      ORDER BY p.name ASC
    `).all();
    res.json(pcs);
  });

  app.post("/api/pcs", (req, res) => {
    const { name } = req.body;
    try {
      const info = db.prepare("INSERT INTO pcs (name) VALUES (?)").run(name);
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      res.status(400).json({ error: "PC name must be unique" });
    }
  });

  app.put("/api/pcs/:id", (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
      db.prepare("UPDATE pcs SET name = ? WHERE id = ?").run(name, id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "PC name must be unique" });
    }
  });

  app.delete("/api/pcs/:id", (req, res) => {
    const { id } = req.params;
    const pcId = Number(id);
    
    console.log(`Server: Request to delete PC ID: ${id} (parsed as Number: ${pcId})`);
    
    if (isNaN(pcId)) {
      console.error(`Server: Invalid PC ID received: ${id}`);
      return res.status(400).json({ error: "Invalid PC ID" });
    }
    
    try {
      const pc = db.prepare("SELECT name, status FROM pcs WHERE id = ?").get(pcId) as { name: string, status: string } | undefined;
      
      if (!pc) {
        console.warn(`Server: PC ID ${pcId} not found in database`);
        return res.status(404).json({ error: "Workstation not found" });
      }

      if (pc.status === 'assigned') {
        console.warn(`Server: Refusing to delete assigned PC: ${pc.name} (ID: ${pcId})`);
        return res.status(400).json({ error: `Cannot remove "${pc.name}" because it is currently assigned. Please return it first.` });
      }
      
      console.log(`Server: Deleting PC "${pc.name}" (ID: ${pcId}) and its history...`);
      
      const deleteTransaction = db.transaction((targetId: number) => {
        const assignmentsDeleted = db.prepare("DELETE FROM assignments WHERE pc_id = ?").run(targetId);
        const pcsDeleted = db.prepare("DELETE FROM pcs WHERE id = ?").run(targetId);
        return { assignmentsDeleted: assignmentsDeleted.changes, pcsDeleted: pcsDeleted.changes };
      });
      
      const result = deleteTransaction(pcId);
      
      console.log(`Server: Delete complete. Rows affected:`, result);
      res.json({ success: true, message: "Workstation removed successfully" });
    } catch (error) {
      console.error("Server: Fatal Delete Error:", error);
      res.status(500).json({ error: "Server error during deletion: " + (error as Error).message });
    }
  });

  app.post("/api/assignments", (req, res) => {
    const { pc_id, person_name, person_type } = req.body;
    
    db.transaction(() => {
      // Create assignment
      db.prepare(
        "INSERT INTO assignments (pc_id, person_name, person_type) VALUES (?, ?, ?)"
      ).run(pc_id, person_name, person_type);
      
      // Update PC status
      db.prepare("UPDATE pcs SET status = 'assigned' WHERE id = ?").run(pc_id);
    })();
    
    res.json({ success: true });
  });

  app.put("/api/assignments/:id/return", (req, res) => {
    const { id } = req.params;
    console.log(`Server: Returning assignment ID: ${id}`);
    
    try {
      const success = db.transaction(() => {
        const assignment = db.prepare("SELECT pc_id FROM assignments WHERE id = ?").get(id) as { pc_id: number } | undefined;
        
        if (assignment) {
          // Mark as returned
          db.prepare("UPDATE assignments SET returned_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
          // Free up PC
          db.prepare("UPDATE pcs SET status = 'available' WHERE id = ?").run(assignment.pc_id);
          console.log(`Server: Successfully returned PC ${assignment.pc_id} for assignment ${id}`);
          return true;
        } else {
          console.error(`Server: Assignment ${id} not found`);
          return false;
        }
      })();
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Assignment not found' });
      }
    } catch (error) {
      console.error('Server: Error returning PC:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get("/api/history", (req, res) => {
    const history = db.prepare(`
      SELECT a.*, p.name as pc_name
      FROM assignments a
      JOIN pcs p ON a.pc_id = p.id
      ORDER BY a.assigned_at DESC
    `).all();
    res.json(history);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
