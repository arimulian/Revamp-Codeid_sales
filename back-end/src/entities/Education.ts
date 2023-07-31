import { Column, Entity, Index } from "typeorm";

@Index("education_pkey", ["eduCode"], { unique: true })
@Index("education_edu_name_key", ["eduName"], { unique: true })
@Entity("education", { schema: "master" })
export class Education {
  @Column("character varying", { primary: true, name: "edu_code", length: 5 })
  eduCode: string;

  @Column("character varying", {
    name: "edu_name",
    nullable: true,
    unique: true,
    length: 55,
  })
  eduName: string | null;
}
