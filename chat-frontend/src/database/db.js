import * as SQLite from 'expo-sqlite';

// holds a reference to my database
// connects to database or creates it it can't find it
const db = SQLite.openDatabase('profiles.db');

export const init = () => {
  const promise = new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS images (user TEXT UNIQUE NOT NULL, imageUri TEXT NOT NULL);',
        [],
        () => {
          resolve();
        },
        (_, err) => {
          reject(err);
        }
      );
    });
  });

  return promise;
};

export const insertProfileImage = (user, imageUri) => {
  const promise = new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        // to protect from SQL injection; if lazy can't simply use string interpolation and add variables directly
        // When we feed values in second argument array sqlite package will first validate them and then swap them with the question marks
        // 'INSERT INTO images (user, imageUri) VALUES (?, ?) ON DUPLICATE KEY UPDATE user=?, imageUri=?;',
        'REPLACE INTO images (user, imageUri) VALUES (?, ?)',
        [user, imageUri],
        (_, result) => {
          resolve(result);
        },
        (_, err) => {
          reject(err);
        }
      );
    });
  });

  return promise;
};  

export const fetchProfileImage = (user) => {
  const promise = new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        // to protect from SQL injection; if lazy can't simply use string interpolation and add variables directly
        // When we feed values in second argument array sqlite package will first validate them and then swap them with the question marks
        'SELECT imageUri FROM images WHERE user=?',
        // 'DROP TABLE images;',
        //  WHERE user=${user};
        [user],
        (_, result) => {
          resolve(result);
        },
        (_, err) => {
          reject(err);
        }
      );
    });
  });

  return promise;
};

export const deleteProfileImage = (user) => {
  const promise = new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM images WHERE user=?',
        [user],
        (_, result) => {
          resolve(result);
        },
        (_, err) => {
          reject(err);
        }
      );
    });
  });
};