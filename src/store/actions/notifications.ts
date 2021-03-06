// types and action creators: dispatched by components and sagas

import {
  notificationTag,
  notificationType,
} from '../../bitcoin/utilities/Interface';

export const UPDATE_FCM_TOKENS = 'UPDATE_FCM_TOKENS';
export const SEND_NOTIFICATION = 'SEND_NOTIFICATION';
export const FETCH_NOTIFICATIONS = 'FETCH_NOTIFICATIONS';

export const updateFCMTokens = (FCMs: string[]) => {
  return {
    type: UPDATE_FCM_TOKENS,
    payload: { FCMs },
  };
};

export const sendNotification = (
  receiverWalletID: string,
  notificationType: notificationType,
  title: string,
  body: string,
  data: Object,
  tag: notificationTag,
) => {
  return {
    type: SEND_NOTIFICATION,
    payload: { receiverWalletID, notificationType, title, body, data, tag },
  };
};

export const fetchNotifications = () => {
  return {
    type: FETCH_NOTIFICATIONS,
  };
};

// types and action creators: dispatched sagas

export const NOTIFICATIONS_FETCHED = 'NOTIFICATIONS_FETCHED';

export const notificationsFetched = (notifications) => {
  return {
    type: NOTIFICATIONS_FETCHED,
    payload: { notifications },
  };
};
