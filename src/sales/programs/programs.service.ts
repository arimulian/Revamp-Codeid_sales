import { Injectable, BadRequestException } from '@nestjs/common';
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
import { Status } from 'output/entities/Status';
import { Employee } from 'output/entities/Employee';
import { RouteActions } from 'output/entities/RouteActions';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Users) private serviceU: Repository<Users>,
    @InjectRepository(UsersEducation)
    private serviceUE: Repository<UsersEducation>,
    @InjectRepository(UsersMedia)
    private serviceUM: Repository<UsersMedia>,
    @InjectRepository(ProgramEntity)
    private servicePE: Repository<ProgramEntity>,
    @InjectRepository(ProgramApplyProgress)
    private servicePAP: Repository<ProgramApplyProgress>,
    @InjectRepository(ProgramApply) private servicePA: Repository<ProgramApply>,
    @InjectRepository(Employee) private serviceE: Repository<Employee>,
  ) {}

  private order(orderBy: string) {
    // set order by clause
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
      // get all available bootcamp data
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
      // get searched boorcamp data
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
      // get bootcamp dashboard data of user
      const query = `SELECT
          u.user_entity_id AS "userEntityId",
          u.user_first_name AS "userFirstName",
          u.user_last_name AS "userLastName",
          pe.prog_title AS "progTitle",
          pa.prap_status AS "prapStatus",
          pa.prap_modified_date AS "prapModifiedDate",
          (
            SELECT pap.parog_progress_name
            FROM bootcamp.program_apply_progress AS pap
            WHERE pap.parog_id = (
              SELECT MAX(parog_id)
              FROM bootcamp.program_apply_progress
              WHERE parog_prog_entity_id = pa.prap_prog_entity_id
            )
          ) AS "latestProgress"
        FROM
          curriculum.program_entity pe
        JOIN bootcamp.program_apply pa ON pa.prap_prog_entity_id = pe.prog_entity_id
        JOIN users.users u ON u.user_entity_id = pa.prap_user_entity_id
        WHERE u.user_entity_id = $1::integer`;
      const param = [userEntityId];

      const dashboard = await this.serviceU.query(query, param);

      return dashboard;
    } catch (error) {
      return error.message;
    }
  }

  public async getUser(userEntityId: number): Promise<Users> {
    try {
      // get user data
      const User = await this.serviceU.findOne({
        where: { userEntityId: userEntityId },
      });
      return User;
    } catch (error) {
      return error.message;
    }
  }

  public async getUserEdu(userEntityId: number): Promise<UsersEducation> {
    try {
      // get user education data
      const userEdu = await this.serviceUE.findOne({
        where: { usduEntityId: userEntityId },
      });
      return userEdu;
    } catch (error) {
      return error.message;
    }
  }

  public async getUserMedia(
    userEntityId: number,
    note: string,
  ): Promise<UsersMedia> {
    try {
      // get user media data based on file note
      const userMedia = await this.serviceUM.findOne({
        where: {
          usmeEntityId: userEntityId,
          usmeNote: note,
        },
      });
      return userMedia;
    } catch (error) {
      return error.message;
    }
  }

  private getFileType(file: string) {
    // set usme filetype
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
      throw new BadRequestException(
        'Unable to take file format. Only .jpg, .pdf, and .docx are allowed',
      );
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

      // update users data
      const getUser = await this.getUser(userEntityId);

      getUser.userFirstName = user.firstName;
      getUser.userLastName = user.lastName;
      getUser.userBirthDate = user.birthDate;

      const usersUpdate = await this.serviceU.save(getUser);

      // update users education data
      const getUserEdu = await this.getUserEdu(userEntityId);

      getUserEdu.usduSchool = education.school;
      getUserEdu.usduDegree = education.degree;
      getUserEdu.usduFieldStudy = education.fieldStudy;

      const usersEduUpdate = await this.serviceUE.save(getUserEdu);

      // upload / create new users cv
      const cvData = {
        usmeEntityId: userEntityId,
        usmeFileLink: `http://localhost:3001/programs/image/${file.originalname}`,
        usmeFilename: file.originalname,
        usmeFilesize: file.size,
        usmeNote: 'Curicullum Vitae',
        usmeFiletype: FileType,
        usmeModifiedDate: new Date(),
      };

      let getCV = await this.getUserMedia(userEntityId, 'Curicullum Vitae');

      if (getCV) {
        getCV = { ...getCV, ...cvData };
      } else {
        getCV = this.serviceUM.create(cvData);
      }

      const updateCv = await this.serviceUM.save(getCV);

      return { usersUpdate, usersEduUpdate, updateCv };
    } catch (error) {
      return error.message;
    }
  }

  public async uploadUserPhoto(userEntityId: number, file: any) {
    try {
      const FileType = this.getFileType(file.mimetype);

      // update users userPhoto
      const getUser = await this.getUser(userEntityId);

      getUser.userPhoto = file.originalname;
      getUser.userModifiedDate = new Date();

      const usersUpdate = await this.serviceU.save(getUser);

      // update / create profile picture in userMedia
      const photoData = {
        usmeEntityId: userEntityId,
        usmeFileLink: `http://localhost:3001/programs/image/${file.originalname}`,
        usmeFilename: file.originalname,
        usmeFilesize: file.size,
        usmeNote: 'Profile Photo',
        usmeFiletype: FileType,
        usmeModifiedDate: new Date(),
      };

      let Photo = await this.getUserMedia(userEntityId, 'Profile Photo');

      if (Photo) {
        Photo = { ...Photo, ...photoData };
      } else {
        Photo = this.serviceUM.create(photoData);
      }

      const newPhoto = await this.serviceUM.save(Photo);

      return { usersUpdate, newPhoto };
    } catch (error) {
      return error.message;
    }
  }

  public async getProgress(
    userEntityId: number,
  ): Promise<ProgramApplyProgress[]> {
    try {
      // get bootcamp apply progress data
      const progress = await this.servicePAP.find({
        where: {
          parogUserEntityId: userEntityId,
        },
        relations: {
          parogRoac: true,
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
        pe.prog_entity_id AS "progEntityId",
        pe.prog_title AS "progTitle",
        pe.prog_headline AS "progHeadline",
        pe.prog_total_trainee AS "progTotalTrainee",
        pe.prog_price AS "progPrice",
        pe.prog_duration AS "progDuration",
        pe.prog_city_id AS "progCityId",
        pe.prog_created_by AS "progCreatedBy",
        u.user_entity_id AS "userEntityId",
        u.user_first_name AS "userFirstName",
        u.user_last_name AS "userLastName",
        u.user_photo AS "userPhoto"
      FROM curriculum.program_entity pe
      JOIN hr.employee e on e.emp_entity_id = pe.prog_created_by
      JOIN users.users u on u.user_entity_id = e.emp_entity_id
      WHERE pe.prog_entity_id = $1::integer`;

      const query2 = `SELECT pred_item_learning AS "predItemLearning" FROM curriculum.program_entity_description WHERE pred_prog_entity_id = $1::integer`;

      const query3 = `SELECT 
        s.sect_id AS "sectId",
        s.sect_prog_entity_id AS "sectProgEntity",
        s.sect_title AS "sectTitle",
        JSONB_AGG(JSON_BUILD_OBJECT('secdId', sd.secd_id, 'secdTitle', sd.secd_title)) AS "sectionDetails"
      FROM curriculum.sections s
      JOIN curriculum.section_detail sd ON s.sect_id = sd.secd_sect_id
      WHERE s.sect_prog_entity_id = $1::integer
      GROUP BY s.sect_id, s.sect_prog_entity_id;`;

      const query4 = `SELECT 
        pr.prow_user_entity_id AS "prowUserEntity",
        pr.prow_prog_entity_id AS "prowProgEntity",
        pr.prow_review AS "prowReview",
        pr.prow_rating AS "prowRating",
        u.user_entity_id AS "reviewUserEntityId",
        u.user_first_name AS "reviewUserFirstName",
        u.user_last_name AS "reviewUserLastName",
        u.user_photo AS "reviewUserPhoto"
      FROM curriculum.program_reviews pr
      JOIN users.users u on u.user_entity_id = pr.prow_user_entity_id
      WHERE pr.prow_prog_entity_id = $1::integer`;

      const param = [progEntityId];

      // get detail bootcamp and mentor data
      const [bootcampAndMentor] = await this.servicePE.query(query1, param);
      // get learning items data (What you'll learn section)
      const [learnItems] = await this.servicePE.query(query2, param);
      // get bootcamp material data
      const material = await this.servicePE.query(query3, param);
      // get review data
      const review = await this.servicePE.query(query4, param);

      return { bootcampAndMentor, learnItems, material, review };
    } catch (error) {
      return error.message;
    }
  }

  public async applyBootcamp(userEntityId: number, progEntityId: number) {
    try {
      // create new bootcamp apply application

      const Apply = this.servicePA.create({
        prapUserEntityId: userEntityId,
        prapProgEntityId: progEntityId,
        prapTestScore: 0,
        prapGpa: 0,
        prapIqTest: 0,
        prapReview: null,
        prapModifiedDate: new Date(),
        prapStatus: { status: 'Apply' } as Status,
      });

      const createApply = await this.servicePA.save(Apply);

      const parogEmp = await this.serviceE
        .createQueryBuilder('employee')
        .select('employee.emp_entity_id AS "empEntityId"')
        .where('employee.empJoro = :empJoroId', { empJoroId: 5 })
        .andWhere('employee.empCurrentFlag = :empCurrentFlag', {
          empCurrentFlag: 1,
        })
        .getRawOne();

      const ApplyProgress = this.servicePAP.create({
        parogUserEntityId: userEntityId,
        parogProgEntityId: progEntityId,
        parogActionDate: new Date(),
        parogModifiedDate: new Date(),
        parogComment: null,
        parogProgressName: 'Done',
        parogEmpEntity: { empEntityId: parogEmp.empEntityId } as Employee,
        parogStatus: { status: 'Open' } as Status,
        parogRoac: { roacId: 1 } as RouteActions,
      });

      const createApplyProgress = await this.servicePAP.save(ApplyProgress);

      return { createApply, createApplyProgress };
    } catch (error) {
      return error.message;
    }
  }
}
