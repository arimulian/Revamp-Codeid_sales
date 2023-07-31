import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { ProgramEntity } from "./ProgramEntity";
import { SalesOrderHeader } from "./SalesOrderHeader";
import { Modules } from "./Modules";

@Index("status_pkey", ["status"], { unique: true })
@Entity("status", { schema: "master" })
export class Status {
  @Column("character varying", { primary: true, name: "status", length: 15 })
  status: string;

  @Column("timestamp without time zone", {
    name: "status_modified_date",
    nullable: true,
  })
  statusModifiedDate: Date | null;

  @OneToMany(() => ProgramEntity, (programEntity) => programEntity.progStatus)
  programEntities: ProgramEntity[];

  @OneToMany(
    () => SalesOrderHeader,
    (salesOrderHeader) => salesOrderHeader.soheStatus
  )
  salesOrderHeaders: SalesOrderHeader[];

  @ManyToOne(() => Modules, (modules) => modules.statuses)
  @JoinColumn([{ name: "status_module", referencedColumnName: "moduleName" }])
  statusModule: Modules;
}
