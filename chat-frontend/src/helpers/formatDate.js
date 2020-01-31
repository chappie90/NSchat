import moment from 'moment';

export const formatDate = (date) => {
  // test older / newer days with 
  // moment(date).subtract/add(1, 'days').calendar()/fromNow().format('dddd') 
  const inputDate = moment(date);
  const diff = moment().diff(inputDate, 'days');

  let outputDate;

  if (diff === 0) {
    outputDate = inputDate.fromNow(); 
  } else if (diff < 7) {
    outputDate = inputDate.format('dddd');
  } else {
    outputDate = inputDate.format('ll');
  }

  return outputDate;
};