import prefixer from '../../utils/reducerPrefixer';
import { throwAlert } from '../Alerts/actions';
import {
  processMtpBuffer,
  processLocalBuffer,
} from '../../utils/processBufferOutput';
import { isArraysEqual, isEmpty, undefinedOrNull } from '../../utils/funcs';
import { DEVICE_TYPE, MTP_MODE } from '../../enums';
import { log } from '../../utils/log';
import fileExplorerController from '../../data/file-explorer/controllers/FileExplorerController';
import { checkIf } from '../../utils/checkIf';
import { MTP_ERROR } from '../../enums/mtpError';

const prefix = '@@Home';
const actionTypesList = [
  'SET_FOCUSSED_FILE_EXPLORER_DEVICE_TYPE',
  'SET_CURRENT_BROWSE_PATH',
  'SET_SORTING_DIR_LISTS',
  'SET_SELECTED_DIR_LISTS',
  'LIST_DIRECTORY',
  'SET_MTP_ERRORS',
  'SET_MTP_STATUS',
  'CHANGE_MTP_STORAGE',
  'SET_FILE_TRANSFER_CLIPBOARD',
  'SET_FILE_TRANSFER_PROGRESS',
  'CLEAR_FILE_TRANSFER',
  'SET_FILES_DRAG',
  'CLEAR_FILES_DRAG',
];

export const actionTypes = prefixer(prefix, actionTypesList);

export function setFocussedFileExplorerDeviceType(data) {
  return {
    type: actionTypes.SET_FOCUSSED_FILE_EXPLORER_DEVICE_TYPE,
    payload: {
      ...data,
    },
  };
}

export function setSortingDirLists(data, deviceType) {
  return {
    type: actionTypes.SET_SORTING_DIR_LISTS,
    deviceType,
    payload: {
      ...data,
    },
  };
}

export function setSelectedDirLists(data, deviceType) {
  return {
    type: actionTypes.SET_SELECTED_DIR_LISTS,
    deviceType,
    payload: {
      ...data,
    },
  };
}

export function setCurrentBrowsePath(path, deviceType) {
  return {
    type: actionTypes.SET_CURRENT_BROWSE_PATH,
    deviceType,
    payload: path,
  };
}

function _listDirectory(data, deviceType, _) {
  return {
    type: actionTypes.LIST_DIRECTORY,
    deviceType,
    payload: {
      nodes: data ?? [],
      isLoaded: true,
    },
  };
}

export function getStorageId(state) {
  if (
    undefinedOrNull(state.mtpStoragesList) ||
    Object.keys(state.mtpStoragesList).length < 1
  ) {
    return null;
  }

  const { mtpStoragesList } = state;
  const mtpStoragesListKeys = Object.keys(mtpStoragesList);

  for (let i = 0; i < mtpStoragesListKeys.length; i += 1) {
    const itemKey = mtpStoragesListKeys[i];

    if (mtpStoragesList[itemKey].selected) {
      return itemKey;
    }
  }

  return null;
}

export function initializeMtp(
  { filePath, ignoreHidden, changeMtpStorageIdsOnlyOnDeviceChange, deviceType },
  getState
) {
  checkIf(deviceType, 'string');
  checkIf(filePath, 'string');
  checkIf(ignoreHidden, 'boolean');
  checkIf(changeMtpStorageIdsOnlyOnDeviceChange, 'boolean');
  checkIf(getState, 'function');

  const { mtpStoragesList } = getState().Home;
  const { mtpMode } = getState().Settings;

  return async (dispatch) => {
    try {
      // await kalamFfi.InitializeMtp();
      // await kalamFfi.FetchDeviceInfo();
      // // const { data: storagesData } = await kalamFfi.FetchStorages();
      // const { data: mkDirData1 } = await kalamFfi.MakeDirectory({
      //   storageId: storagesData[0].Sid.toString(),
      //   fullPath: '/test2',
      // });
      // const { data: mkDirData2 } = await kalamFfi.MakeDirectory({
      //   storageId: storagesData[0].Sid.toString(),
      //   fullPath: '/TEST1',
      // });
      //
      // const { data: renameFileData } = await kalamFfi.RenameFile({
      //   storageId: storagesData[0].Sid.toString(),
      //   fullPath: '/TEST1',
      //   newFileName: '/test1',
      // });
      //
      // const { data: fileExistsData } = await kalamFfi.FileExists({
      //   storageId: storagesData[0].Sid.toString(),
      //   files: ['/test1', '/test2'],
      // });
      //
      // const { data: deleteFileData } = await kalamFfi.DeleteFile({
      //   storageId: storagesData[0].Sid.toString(),
      //   files: ['/TEST2', '/TEST1'],
      // });
      //
      // const { data: fileExistsData2 } = await kalamFfi.FileExists({
      //   storageId: storagesData[0].Sid.toString(),
      //   files: ['/TEST1', '/TEST2'],
      // });
      // const { data: WalkData } = await kalamFfi.Walk({
      //   storageId: storagesData[0].Sid.toString(),
      //   fullPath: '/',
      // });
      //
      // const tempDataPath = path.resolve(
      //   path.join('./mtp-mock-files', 'mtp-test-files', 'test-large-file')
      // );
      // const {
      //   data: UploadFilesData,
      // } = await kalamFfi.UploadFiles({
      //   storageId: storagesData[0].Sid.toString(),
      //   sources: [tempDataPath],
      //   destination: '/mtp-test-files/temp_dir',
      //   preprocessFiles: true, //todo
      // });
      // const { data: downloadFilesData } = await kalamFfi.DownloadFiles({
      //   storageId: storagesData[0].Sid.toString(),
      //   sources: ['/mtp-test-files/test-large-file'],
      //   destination: tempDataPath,
      //   preprocessFiles: true, //todo
      // });
      // await kalamFfi.Dispose();
      // if(mode==legacy){
      //   initLegacyMtp()
      // }

      switch (mtpMode) {
        case MTP_MODE.kalam:
          return dispatch(
            initKalamMtp(
              {
                filePath,
                ignoreHidden,
                deviceType,
                changeMtpStorageIdsOnlyOnDeviceChange,
              },
              getState
            )
          );

        case MTP_MODE.legacy:
          return dispatch(
            initLegacyMtp(
              {
                filePath,
                ignoreHidden,
                deviceType,
                mtpStoragesList,
                changeMtpStorageIdsOnlyOnDeviceChange,
              },
              getState
            )
          );

        default:
          throw `invalid value for  'mtpMode'`;
      }
    } catch (e) {
      log.error(e);
    }
  };
}

function initKalamMtp(
  { filePath, ignoreHidden, deviceType, changeMtpStorageIdsOnlyOnDeviceChange },
  getState
) {
  return async (dispatch) => {
    checkIf(filePath, 'string');
    checkIf(ignoreHidden, 'boolean');
    checkIf(deviceType, 'string');
    checkIf(changeMtpStorageIdsOnlyOnDeviceChange, 'boolean');

    try {
      const { mtpMode } = getState().Settings;
      const { mtpDevice: preInitMtpDevice } = getState().Home;

      checkIf(preInitMtpDevice, 'object');

      // if the app was expecting the user to allow access to mtp storage
      // then don't reinitialize mtp
      const { error, stderr, data } = await fileExplorerController.initialize({
        deviceType,
      });

      await new Promise((resolve) => {
        dispatch(
          churnMtpBuffer({
            deviceType,
            error,
            stderr,
            data,
            mtpMode,
            onSuccess: () => {
              //todo set device info
              return resolve({
                error: null,
                stderr: null,
                data,
              });
            },
            onError: () => {
              return resolve({
                error,
                stderr,
                data: null,
              });
            },
          })
        );
      });

      const { mtpDevice: postInitMtpDevice } = getState().Home;

      checkIf(postInitMtpDevice, 'object');

      if (!postInitMtpDevice.isAvailable) {
        return;
      }

      await new Promise((resolve) => {
        dispatch(
          listKalamStorages(
            {
              filePath,
              ignoreHidden,
              deviceType,
              changeMtpStorageIdsOnlyOnDeviceChange,
              onSuccess() {
                resolve();
              },
              onError() {
                resolve();
              },
            },
            getState
          )
        );
      });

      const { mtpDevice: postStorageAccessMtpDevice } = getState().Home;

      checkIf(postStorageAccessMtpDevice, 'object');

      if (!postStorageAccessMtpDevice.isAvailable) {
        console.log('postStorageAccessMtpDevice not isAvailable');

        return;
      }
      console.log('postStorageAccessMtpDevice isAvailable');

      dispatch(reloadDirList({ filePath, ignoreHidden, deviceType }, getState));

      //todo
      //todo
      //todo
      //todo
      //todo
      //todo
    } catch (e) {
      log.error(e);
    }
  };
}

function listKalamStorages(
  {
    filePath,
    ignoreHidden,
    deviceType,
    changeMtpStorageIdsOnlyOnDeviceChange,
    onSuccess,
    onError,
  },
  getState
) {
  return async (dispatch) => {
    checkIf(filePath, 'string');
    checkIf(ignoreHidden, 'boolean');
    checkIf(deviceType, 'string');
    checkIf(changeMtpStorageIdsOnlyOnDeviceChange, 'boolean');
    checkIf(onSuccess, 'function');
    checkIf(onError, 'function');

    try {
      const { mtpMode } = getState().Settings;

      checkIf(mtpMode, 'string');

      const { error, stderr, data } = await fileExplorerController.listStorages(
        {
          deviceType,
        }
      );

      return new Promise((resolve) => {
        dispatch(
          churnMtpBuffer({
            deviceType,
            error,
            stderr,
            data,
            mtpMode,
            onSuccess: async () => {
              dispatch(changeMtpStorage({ ...data }));

              onSuccess();

              return resolve({
                error: null,
                stderr: null,
                data,
              });
            },
            onError: async () => {
              onError();

              return resolve({
                error,
                stderr,
                data: null,
              });
            },
          })
        );
      });
    } catch (e) {
      log.error(e);
    }
  };
}

function initLegacyMtp(
  {
    filePath,
    ignoreHidden,
    deviceType,
    mtpStoragesList,
    changeMtpStorageIdsOnlyOnDeviceChange,
  },
  getState
) {
  return async (dispatch) => {
    checkIf(filePath, 'string');
    checkIf(ignoreHidden, 'boolean');
    checkIf(deviceType, 'string');
    checkIf(mtpStoragesList, 'object');
    checkIf(changeMtpStorageIdsOnlyOnDeviceChange, 'boolean');

    const { mtpMode } = getState().Settings;

    try {
      const { error, stderr, data } = await fileExplorerController.listStorages(
        {
          deviceType,
        }
      );

      dispatch(
        churnMtpBuffer({
          deviceType,
          error,
          stderr,
          data,
          mtpMode,
          onSuccess: () => {
            let updateMtpStorage = true;

            if (
              changeMtpStorageIdsOnlyOnDeviceChange &&
              !isEmpty(mtpStoragesList) &&
              isArraysEqual(Object.keys(data), Object.keys(mtpStoragesList))
            ) {
              updateMtpStorage = false;
            }

            if (updateMtpStorage) {
              dispatch(changeMtpStorage({ ...data }));
            }

            dispatch(
              listDirectory(
                {
                  filePath,
                  ignoreHidden,
                },
                deviceType,
                getState
              )
            );
          },
        })
      );
    } catch (e) {
      log.error(e);
    }
  };
}

export function changeMtpStorage({ ...data }) {
  return {
    type: actionTypes.CHANGE_MTP_STORAGE,
    payload: data,
  };
}

export function setMtpStatus({ isAvailable, error }) {
  return {
    type: actionTypes.SET_MTP_STATUS,
    payload: { isAvailable, error },
  };
}

// This is the main entry point of data received from the MTP kernel.
// The data received here undergoes processing and the neccessary actions are taken accordingly
export function churnMtpBuffer({
  deviceType,
  error,
  stderr,
  _,
  mtpMode,
  onSuccess,
  onError,
}) {
  checkIf(onSuccess, 'function');
  checkIf(mtpMode, 'string');

  return async (dispatch) => {
    try {
      const {
        mtpStatus,
        error: mtpError,
        throwAlert: mtpThrowAlert,
        logError: mtpLogError,
      } = await processMtpBuffer({ error, stderr, mtpMode });

      console.log('mtpStatus', mtpStatus);

      dispatch(
        setMtpStatus({
          isAvailable: mtpStatus,
          error: mtpMode === MTP_MODE.kalam ? stderr : error,
        })
      );

      if (!mtpStatus) {
        dispatch(_listDirectory([], deviceType));
        dispatch(setSelectedDirLists({ selected: [] }, deviceType));
      }

      if (mtpError) {
        log.error(mtpError, 'churnMtpBuffer', mtpLogError);
        if (mtpThrowAlert) {
          dispatch(throwAlert({ message: mtpError.toString() }));
        }

        if (onError) {
          return onError();
        }

        return;
      }

      return onSuccess();
    } catch (e) {
      log.error(e);
    }
  };
}

// this is the main entry point of data received from the local disk file actions.
// the data received here undergoes processing and the neccessary actions are taken accordingly
export function churnLocalBuffer({ _, error, stderr, __, onSuccess }) {
  checkIf(onSuccess, 'function');

  return (dispatch) => {
    try {
      const {
        error: localError,
        throwAlert: localThrowAlert,
        logError: localLogError,
      } = processLocalBuffer({ error, stderr });

      if (localError) {
        log.error(localError, 'churnLocalBuffer', localLogError);

        if (localThrowAlert) {
          dispatch(throwAlert({ message: localError.toString() }));
        }

        return false;
      }

      onSuccess();
    } catch (e) {
      log.error(e);
    }
  };
}

export function listDirectory(
  { filePath, ignoreHidden },
  deviceType,
  getState
) {
  checkIf(filePath, 'string');
  checkIf(ignoreHidden, 'boolean');
  checkIf(getState, 'function');

  const { mtpMode } = getState().Settings;

  try {
    switch (deviceType) {
      case DEVICE_TYPE.local:
        return async (dispatch) => {
          const { error, data } = await fileExplorerController.listFiles({
            deviceType,
            filePath,
            ignoreHidden,
            storageId: null,
          });

          if (error) {
            log.error(error, 'listDirectory -> listFiles');
            dispatch(
              throwAlert({ message: `Unable fetch data from the Local disk.` })
            );

            return;
          }

          dispatch(_listDirectory(data, deviceType), getState);
          dispatch(setCurrentBrowsePath(filePath, deviceType));
          dispatch(setSelectedDirLists({ selected: [] }, deviceType));
        };

      case DEVICE_TYPE.mtp:
        return async (dispatch) => {
          const storageId = getStorageId(getState().Home);

          const {
            error,
            stderr,
            data,
          } = await fileExplorerController.listFiles({
            deviceType,
            filePath,
            ignoreHidden,
            storageId,
          });

          dispatch(
            churnMtpBuffer({
              deviceType,
              error,
              stderr,
              data,
              mtpMode,
              onSuccess: () => {
                dispatch(_listDirectory(data, deviceType), getState);
                dispatch(setSelectedDirLists({ selected: [] }, deviceType));
                dispatch(setCurrentBrowsePath(filePath, deviceType));
              },
            })
          );
        };

      default:
        break;
    }
  } catch (e) {
    log.error(e);
  }
}

export function reloadDirList(
  { filePath, ignoreHidden, deviceType },
  getState
) {
  checkIf(deviceType, 'string');
  checkIf(filePath, 'string');
  checkIf(ignoreHidden, 'boolean');
  checkIf(getState, 'function');

  const { mtpMode, mtpDevice } = getState().Home;

  checkIf(mtpDevice, 'object');

  return (dispatch) => {
    switch (deviceType) {
      case DEVICE_TYPE.local:
        return dispatch(
          listDirectory({ filePath, ignoreHidden }, deviceType, getState)
        );

      case DEVICE_TYPE.mtp:
        switch (mtpMode) {
          case MTP_MODE.legacy:
            return dispatch(
              initializeMtp(
                {
                  filePath,
                  ignoreHidden,
                  changeMtpStorageIdsOnlyOnDeviceChange: true,
                  deviceType,
                },
                getState
              )
            );

          case MTP_MODE.kalam:
          default:
            if (mtpDevice.isAvailable) {
              //todo if an error occured while listing then call init mtp

              console.log('isAvailable');

              return dispatch(
                listDirectory(
                  {
                    filePath,
                    ignoreHidden,
                  },
                  deviceType,
                  getState
                )
              );
            }

            console.log('not isAvailable');
            // if the mtp was not previously initialized then initialize it
            return dispatch(
              initializeMtp(
                {
                  filePath,
                  ignoreHidden,
                  changeMtpStorageIdsOnlyOnDeviceChange: true,
                  deviceType,
                },
                getState
              )
            );
        }

      default:
        break;
    }
  };
}

export function setFileTransferClipboard({ ...data }) {
  return {
    type: actionTypes.SET_FILE_TRANSFER_CLIPBOARD,
    payload: {
      ...data,
    },
  };
}

export function setFileTransferProgress({ ...data }) {
  return {
    type: actionTypes.SET_FILE_TRANSFER_PROGRESS,
    payload: {
      ...data,
    },
  };
}

export function clearFileTransfer() {
  return {
    type: actionTypes.CLEAR_FILE_TRANSFER,
  };
}

export function setFilesDrag({ ...data }) {
  return {
    type: actionTypes.SET_FILES_DRAG,
    payload: {
      ...data,
    },
  };
}

export function clearFilesDrag() {
  return {
    type: actionTypes.CLEAR_FILES_DRAG,
  };
}
