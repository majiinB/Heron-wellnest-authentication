import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity("college_departments")
export class CollegeDepartment {
  @PrimaryGeneratedColumn("uuid")
  department_id!: string;

  @Column({ type: "varchar", length: 255 , nullable: false})
  department_name!: string;

  @Column({ type: "boolean" })
  is_deleted!: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;
}