import moment from 'moment';

export const formatDate = (date) => {
  // test older / newer days with 
  // moment(date).subtract/add(1, 'days').calendar()/fromNow().format('dddd') 
  const inputDate = moment(date);
  const diff = moment().diff(inputDate, 'days');

  let outputDate;

  // before - after locale comparison
  // a few seconds ago - seconds ago
  // a minute ago - same
  // n minutes ago - n min ago (original was n m ago but changed mm: '%dm' to mm: '%dmin')
  // an hour ago - same

  moment.updateLocale('en', {
    relativeTime: {
      past: '%s ago',
      s:  'seconds',
      ss: '%ss',
      m:  'a minute',
      mm: '%dmin',
      h:  'an hour',
      hh: '%dh'
    }
  });

  if (diff === 0) {
    outputDate = inputDate.fromNow(); 
  } else if (diff < 7) {
    outputDate = inputDate.format('dddd');
  } else {
    outputDate = inputDate.format('ll');
  }

  return outputDate;
};