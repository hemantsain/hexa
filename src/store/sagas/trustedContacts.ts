import { call, put, select } from 'redux-saga/effects';
import {
  INITIALIZE_TRUSTED_CONTACT,
  trustedContactInitialized,
  APPROVE_TRUSTED_CONTACT,
  trustedContactApproved,
} from '../actions/trustedContacts';
import { createWatcher } from '../utils/utilities';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import { insertIntoDB } from '../actions/storage';

function* initializedTrustedContactWorker({ payload }) {
  const service: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );

  const { contactName } = payload;
  const res = yield call(service.initializeContact, contactName);
  if (res.status === 200) {
    const { publicKey } = res.data;
    yield put(trustedContactInitialized(contactName, publicKey));

    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      TRUSTED_CONTACTS: JSON.stringify(service),
    };
    yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
  } else {
    console.log(res.err);
  }
}

export const initializedTrustedContactWatcher = createWatcher(
  initializedTrustedContactWorker,
  INITIALIZE_TRUSTED_CONTACT,
);

function* approveTrustedContactWorker({ payload }) {
  const trustedContacts: TrustedContactsService = yield select(
    (state) => state.trustedContacts.service,
  );

  const { contactName, contactsPublicKey } = payload;

  const res = yield call(
    trustedContacts.finalizeContact,
    contactName,
    contactsPublicKey,
  );
  if (res.status === 200) {
    yield put(trustedContactApproved(contactName, true));

    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      TRUSTED_CONTACTS: JSON.stringify(trustedContacts),
    };
    yield put(insertIntoDB({ SERVICES: updatedSERVICES }));
  } else {
    console.log(res.err);
  }
}

export const approveTrustedContactWatcher = createWatcher(
  approveTrustedContactWorker,
  APPROVE_TRUSTED_CONTACT,
);
