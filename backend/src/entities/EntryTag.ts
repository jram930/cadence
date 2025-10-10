import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Entry } from './Entry';
import { Tag } from './Tag';

@Entity('entry_tags')
@Index(['entryId', 'tagId'], { unique: true })
export class EntryTag {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  entryId!: string;

  @ManyToOne(() => Entry, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'entryId' })
  entry!: Entry;

  @Column({ type: 'uuid' })
  tagId!: string;

  @ManyToOne(() => Tag, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tagId' })
  tag!: Tag;

  @CreateDateColumn()
  createdAt!: Date;
}
