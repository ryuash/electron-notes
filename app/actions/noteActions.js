const db = require('electron-db');
import type { GetState, Dispatch } from '../reducers/types';
// import * as storage from 'electron-json-storage';

//actions
export const UPDATE_NOTE = 'UPDATE_NOTE';
export const GET_ALL_NOTES = 'GET_ALL_NOTES';
export const SELECTED_NOTE = 'SELECTED_NOTE';
export const SAVE = 'SAVE';
export const CREATE_NEW = 'CREATE_NEW';
export const TRACK_UNSAVE = 'TRACK_UNSAVE';
export const SAVE_ALL = 'SAVE_ALL';
//dispatch

export const saveAll = savedNotes => {
  return {
    type: SAVE_ALL,
    savedNotes
  };
};

export const save = date => {
  return {
    type: SAVE,
    date
  };
};

export const trackUnsave = note => {
  return {
    type: TRACK_UNSAVE,
    note
  };
};

export const createNew = note => {
  return {
    type: CREATE_NEW,
    note
  };
};
export const selectedNote = note => {
  return {
    type: SELECTED_NOTE,
    note
  };
};

export function updateNote(note) {
  return {
    type: UPDATE_NOTE,
    note
  };
}

export function getAllNotes(allNotes) {
  return {
    type: GET_ALL_NOTES,
    allNotes
  };
}

//thunks
export const saveAllThunk = allNotes => dispatch => {
  try {
    // console.log('save all thunk hit');
    for (let i = 0; i < allNotes.length; i++) {
      // debugger;
      if (allNotes[i].save) {
        // console.log('yes');
        let where = { id: allNotes[i].id };
        let set = { notes: allNotes[i].notes };
        // console.log(where, 'where');
        // console.log(set, 'set');
        db.updateRow('notes', where, set, (succ, msg) => {
          if (succ) {
            console.log('success saving', where, set);
          } else {
            console.log('error');
          }
        });
        delete allNotes[i].save;
      }
      // console.log('no');
    }
    // console.log(allNotes, 'all notes before SAVEALLTHUNKIE');
    // allNotes.forEach(x => {
    //   if (x.save){
    //     console.log(x.id, 'id', x.notes, 'notes');
    //     db.updateRow(
    //       'notes',
    //       { id: x.id },
    //       { notes: x.notes },
    //       (succ, msg) => {
    //         if (succ) {
    //           console.log('success saving');
    //         } else {
    //           console.log('error');
    //         }
    //       }
    //     );
    //   //   delete x.save;
    //   }
    //   return x;
    // });
    console.log(allNotes, 'all notes after');
    // dispatch(saveAll(allNotes));
  } catch (err) {
    console.error(err);
  }
};

export const trackUnsaveThunk = note => async dispatch => {
  try {
    dispatch(trackUnsave(note));
  } catch (err) {
    console.error(err);
  }
};

export const createNewThunk = () => async dispatch => {
  try {
    const newNote = {
      date: new Date().toJSON(),
      notes: ''
    };
    db.insertTableContent('notes', newNote, (succ, msg) => {
      // succ - boolean, tells if the call is successful
      if (succ) {
        dispatch(createNew(newNote));
      }
    });
  } catch (error) {
    console.error(error);
  }
};

export const saveThunk = (date, note) => async dispatch => {
  try {
    await db.updateRow(
      'notes',
      { date: date },
      { notes: note },
      (succ, msg) => {
        if (succ) {
          console.log('success saving');
        } else {
          console.log('error');
        }
      }
    );
    dispatch(save(date));
  } catch (err) {
    console.error(err);
  }
};
export const selectedNoteThunk = note => async dispatch => {
  try {
    dispatch(selectedNote(note));
  } catch (error) {
    console.error(error);
  }
};

export const getAllNotesThunk = () => async dispatch => {
  try {
    await db.getAll('notes', (succ, data) => {
      // succ - boolean, tells if the call is successful
      // data - array of objects that represents the rows.
      if (succ) {
        dispatch(getAllNotes(data));
      }
    });
  } catch (err) {
    console.error(err);
  }
};

export const updateNoteThunk = note => dispatch => {
  dispatch(updateNote(note));
};
