type BootcampAndMentor = {
  progEntityId: number;
  progTitle: string;
  progHeadline: string;
  progTotalTrainee: number;
  progPrice: number;
  progDuration: number;
  progCityId: number;
  progCreatedBy: number;
  userEntityId: number;
  userFirstName: string;
  userLastName: string;
  userPhoto: any;
};

type LearnItems = {
  predLearnItems: JSON;
};

type Material = {
  sectId: number;
  sectProgEntity: number;
  sectTitle: string;
  sectionDetails: JSON;
};

type Review = {
  prowUserEntity: number;
  prowProgEntity: number;
  prowReview: string;
  prowRating: number;
  reviewUserEntityId: number;
  reviewUserFirstName: string;
  reviewUserLastName: string;
  reviewUserPhoto: string;
};

export interface ViewDetail {
  bootcampAndMentor: BootcampAndMentor[];
  learnItems: LearnItems[];
  material: Material[];
  review: Review[];
}
