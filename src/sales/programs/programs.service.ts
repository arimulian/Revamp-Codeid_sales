import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'output/entities/Users';
import { UsersEducation } from 'output/entities/UsersEducation';
import { UsersMedia } from 'output/entities/UsersMedia';
import { Repository } from 'typeorm';
import { UsersDto } from './dto/programs-users.dto';
import { UsersEducationDto } from './dto/programs-users-education.dto';
import { ProgramEntity } from 'output/entities/ProgramEntity';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { ProgramApplyProgress } from 'output/entities/ProgramApplyProgress';
import { ProgramApply } from 'output/entities/ProgramApply';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Users) private serviceUsers: Repository<Users>,
    @InjectRepository(UsersEducation)
    private serviceUsersEducation: Repository<UsersEducation>,
    @InjectRepository(UsersMedia)
    private serviceUsersMedia: Repository<UsersMedia>,
    @InjectRepository(ProgramEntity)
    private servicePE: Repository<ProgramEntity>,
    @InjectRepository(ProgramApplyProgress)
    private servicePAP: Repository<ProgramApplyProgress>,
    @InjectRepository(ProgramApply) private servicePA: Repository<ProgramApply>,
  ) {}

  private order(orderBy: string) {
    let order = '';
    if (orderBy === 'Online/Offline') {
      order = 'programEntity.progLearningType';
    } else if (orderBy === 'Latest') {
      order = 'programEntity.progModifiedDate';
    } else {
      order = 'programEntity.progRating';
    }

    return order;
  }

  public async findAll(orderBy: string): Promise<ProgramEntity[]> {
    try {
      const order = this.order(orderBy);

      return await this.servicePE
        .createQueryBuilder('programEntity')
        .orderBy(order, 'DESC')
        .getMany();
    } catch (error) {
      return error.message;
    }
  }

  public async findSearch(
    orderBy: string,
    name: string,
    options: IPaginationOptions,
  ): Promise<Pagination<ProgramEntity>> {
    try {
      const order = this.order(orderBy);

      const search = await this.servicePE
        .createQueryBuilder('programEntity')
        .where('programEntity.progTitle ILIKE :name', {
          name: `%${name}%`,
        })
        .orderBy(order, 'DESC');

      return paginate(search, options);
    } catch (error) {
      return error.message;
    }
  }

  public async getDashboard(userEntityId: number) {
    try {
      const query = `SELECT
          u.user_entity_id,
          u.user_first_name,
          u.user_last_name,
          pe.prog_title,
          pa.prap_status,
          pa.prap_modified_date,
          (
            SELECT pap.parog_progress_name
            FROM bootcamp.program_apply_progress AS pap
            WHERE pap.parog_id = (
              SELECT MAX(parog_id)
              FROM bootcamp.program_apply_progress
              WHERE parog_prog_entity_id = pa.prap_prog_entity_id
            )
          ) AS latest_progress
        FROM
          curriculum.program_entity pe
        JOIN bootcamp.program_apply pa ON pa.prap_prog_entity_id = pe.prog_entity_id
        JOIN users.users u ON u.user_entity_id = pa.prap_user_entity_id
        WHERE u.user_entity_id = $1::integer`;
      const param = [userEntityId];

      const Dashboard = await this.serviceUsers.query(query, param);

      return Dashboard;
    } catch (error) {}
  }
  public async getUser(userEntityId: number): Promise<Users> {
    try {
      const User = await this.serviceUsers.findOne({
        where: { userEntityId: userEntityId },
      });
      return User;
    } catch (error) {
      return error.message;
    }
  }

  public async getUserEdu(userEntityId: number): Promise<UsersEducation> {
    try {
      const userEdu = await this.serviceUsersEducation.findOne({
        where: { usduEntityId: userEntityId },
      });
      return userEdu;
    } catch (error) {
      return error.message;
    }
  }

  public async getUserMedia(userEntityId: number): Promise<UsersMedia> {
    try {
      const userMedia = await this.serviceUsersMedia.findOne({
        where: { usmeEntityId: userEntityId },
      });
      return userMedia;
    } catch (error) {
      return error.message;
    }
  }

  private getFileType(file: string) {
    let fileType = '';

    if (file === 'application/pdf') {
      fileType = 'pdf';
    } else if (file === 'image/jpeg') {
      fileType = 'jpg';
    } else if (
      file ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      fileType = 'word';
    } else {
      return 'Only .jpg, .pdf, and .docx are allowed';
    }

    return fileType;
  }

  public async updateUsers(
    userEntityId: number,
    user: UsersDto,
    education: UsersEducationDto,
    file: any,
  ) {
    try {
      const FileType = this.getFileType(file.mimetype);

      const getUser = await this.getUser(userEntityId);

      getUser.userFirstName = user.firstName;
      getUser.userLastName = user.lastName;
      getUser.userBirthDate = user.birthDate;

      const usersUpdate = await this.serviceUsers.save(getUser);

      const getUserEdu = await this.getUserEdu(userEntityId);

      getUserEdu.usduSchool = education.school;
      getUserEdu.usduDegree = education.degree;
      getUserEdu.usduFieldStudy = education.fieldStudy;

      const usersEduUpdate = await this.serviceUsersEducation.save(getUserEdu);

      const getUserFile = await this.getUserMedia(userEntityId);

      getUserFile.usmeEntityId = userEntityId;
      getUserFile.usmeFileLink = 'http://';
      getUserFile.usmeFilename = file.originalname;
      getUserFile.usmeFilesize = file.size;
      getUserFile.usmeFiletype = FileType;
      getUserFile.usmeModifiedDate = new Date();

      const updateCv = await this.serviceUsersMedia.save(getUserFile);

      return { usersUpdate, usersEduUpdate, updateCv };
    } catch (error) {
      return error.message;
    }
  }

  public async getProgress(userEntityId: number) {
    try {
      const progress = await this.servicePAP.find({
        where: {
          parogUserEntityId: userEntityId,
        },
      });

      return progress;
    } catch (error) {
      return error.message;
    }
  }

  public async viewDetail(progEntityId: number) {
    try {
      const query1 = `SELECT  
        pe.prog_entity_id,
        pe.prog_title,
        pe.prog_headline,
        pe.prog_total_trainee,
        pe.prog_price,
        pe.prog_duration,
        pe.prog_city_id,
        pe.prog_created_by,
        u.user_entity_id,
        u.user_first_name,
        u.user_last_name,
        u.user_photo
      FROM curriculum.program_entity pe
      JOIN hr.employee e on e.emp_entity_id = pe.prog_created_by
      JOIN users.users u on u.user_entity_id = e.emp_entity_id
      WHERE pe.prog_entity_id = $1::integer`;

      const query2 = `SELECT 
        s.sect_id,
        s.sect_prog_entity_id,
        s.sect_title,
        JSONB_AGG(JSON_BUILD_OBJECT('secd_id', sd.secd_id, 'secd_title', sd.secd_title)) AS section_details
      FROM curriculum.sections s
      JOIN curriculum.section_detail sd ON s.sect_id = sd.secd_sect_id
      WHERE s.sect_prog_entity_id = $1::integer
      GROUP BY s.sect_id, s.sect_prog_entity_id;`;

      const query3 = `SELECT pred_item_learning FROM curriculum.program_entity_description WHERE pred_prog_entity_id = $1::integer`;

      const query4 = `SELECT 
        pr.prow_user_entity_id,
        pr.prow_prog_entity_id,
        pr.prow_review,
        pr.prow_rating,
        u.user_entity_id,
        u.user_first_name,
        u.user_last_name,
        u.user_photo
      FROM curriculum.program_reviews pr
      JOIN users.users u on u.user_entity_id = pr.prow_user_entity_id
      WHERE pr.prow_prog_entity_id = $1::integer`;

      const param = [progEntityId];

      const bootcampAndMentor = await this.servicePE.query(query1, param);
      const learnItems = await this.servicePE.query(query3, param);
      const material = await this.servicePE.query(query2, param);
      const review = await this.servicePE.query(query4, param);

      return { bootcampAndMentor, learnItems, material, review };
    } catch (error) {
      return error.message;
    }
  }

  public async applyBootcamp(progEntityId: number) {
    try {
      const Apply = new ProgramApply();

      Apply.prapProgEntityId = progEntityId;
      Apply.prapTestScore = 0;
      Apply.prapGpa = 0;
      Apply.prapIqTest = 0;
      Apply.prapModifiedDate = new Date();

      const createApply = await this.servicePA.save(Apply);

      const ApplyProgress = new ProgramApplyProgress();

      ApplyProgress.parogProgEntityId = progEntityId;
      ApplyProgress.parogActionDate = new Date();
      ApplyProgress.parogModifiedDate = new Date();
      ApplyProgress.parogComment = null;
      ApplyProgress.parogProgressName = 'Apply Aplication';

      const createApplyProgress = await this.servicePAP.save(ApplyProgress);

      return { createApply, createApplyProgress };
    } catch (error) {
      return error.message;
    }
  }
}
