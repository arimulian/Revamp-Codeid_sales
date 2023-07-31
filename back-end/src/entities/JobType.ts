import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("job_type_pkey", ["jotyId"], { unique: true })
@Entity("job_type", { schema: "master" })
export class JobType {
  @PrimaryGeneratedColumn({ type: "integer", name: "joty_id" })
  jotyId: number;

  @Column("character varying", {
    name: "joty_name",
    nullable: true,
    length: 55,
  })
  jotyName: string | null;
}
