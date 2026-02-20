export interface PC {
  id: number;
  name: string;
  status: 'available' | 'assigned';
  person_name?: string;
  person_type?: 'student' | 'teacher';
  assignment_id?: number;
}

export interface Assignment {
  id: number;
  pc_id: number;
  pc_name: string;
  person_name: string;
  person_type: 'student' | 'teacher';
  assigned_at: string;
  returned_at: string | null;
}
