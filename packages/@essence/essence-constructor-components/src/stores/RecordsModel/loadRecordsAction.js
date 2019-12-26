/* eslint max-lines: ["error", 500]*/
// @flow
import get from "lodash/get";
import isString from "lodash/isString";
import uuidv4 from "uuid/v4";
import pickBy from "lodash/pickBy";
import forEach from "lodash/forEach";
import isUndefined from "lodash/isUndefined";
import isEqual from "lodash/isEqual";
import {
    VALUE_SELF_FIRST,
    VALUE_SELF_ALWAYSFIRST,
    VAR_RECORD_ID,
    VAR_RECORD_MASTER_ID,
    VAR_RECORD_PAGE_OBJECT_ID,
    VAR_RECORD_QUERY_ID,
    META_PAGE_OBJECT,
    VAR_META_JN_FETCH,
    VAR_META_JN_OFFSET,
    VAR_META_JL_FILTER,
    VAR_META_JL_SORT,
} from "@essence/essence-constructor-share/constants";
import {i18next} from "@essence/essence-constructor-share/utils";
import {snackbarStore} from "@essence/essence-constructor-share/models";
import {loggerRoot} from "../../constants";
import {type CkIdType} from "../../BuilderType";
import {isEmpty, sleep} from "../../utils/base";
import {type PageModelType} from "../PageModel";
import {sendRequestList} from "../../request/baseRequest";
import {findSetKey, findGetGlobalKey} from "../../utils/findKey";
import {type RecordsModelType, type RecordsModelInstanceType, type RecordsStateStatusType} from "./RecordsModelType";
import {CheckLoading, CYCLE_TIMEOUT} from "./checkLoading";

type GetFilterDataType = {
    filter: $PropertyType<RecordsModelType, "filter">,
    order: $PropertyType<RecordsModelType, "order">,
    searchValues: $PropertyType<RecordsModelType, "searchValues">,
    pageSize: $PropertyType<RecordsModelType, "pageSize">,
    pageNumber: $PropertyType<RecordsModelType, "pageNumber">,
};

type AttachGlobalStore = {
    bc: $PropertyType<RecordsModelType, "bc">,
    json: Object,
    globalValues: Map<string, string>,
};

type LoadRecordsActionType = {
    bc: $PropertyType<RecordsModelType, "bc">,
    applicationStore: Object,
    recordId?: any,
    selectedRecordId?: CkIdType,
    isUserReload?: boolean,
    status: RecordsStateStatusType,
};

const logger = loggerRoot.extend("recordsActions");
// 2 frames (16ms)
const WAIT_TIME = 32;

export const getMasterData = (masterObject?: Object, idproperty?: string, globalValues?: Object) => {
    const master = {};

    if (isEmpty(idproperty)) {
        return master;
    }

    forEach(findSetKey(idproperty || ""), (fieldName: string, globaleKey: string) => {
        if (masterObject && masterObject[globaleKey]) {
            const value = masterObject[globaleKey];

            master[fieldName] = isString(value) && value.indexOf("auto-") === 0 ? undefined : value;
        } else if (globalValues && globalValues.has(globaleKey)) {
            const value = globalValues.get(globaleKey);

            master[fieldName] = isString(value) && value.indexOf("auto-") === 0 ? undefined : value;
        }

        if (isEmpty(master[fieldName])) {
            master[fieldName] = undefined;
        }
    });

    return master;
};

export function getMasterObject(masterId?: string, pageStore?: PageModelType): typeof undefined | Object {
    return masterId && pageStore
        ? {
              ...get(pageStore.stores.get(masterId), "selectedRecord", {}),
              ...(pageStore.fieldValueMaster.has(masterId)
                  ? {[VAR_RECORD_ID]: pageStore.fieldValueMaster.get(masterId)}
                  : {}),
          }
        : undefined;
}

export function getPageFilter(pageSize: ?number, pageNumber: number) {
    return pageSize
        ? {
              [VAR_META_JN_FETCH]: pageSize,
              [VAR_META_JN_OFFSET]: pageSize * pageNumber,
          }
        : {
              [VAR_META_JN_FETCH]: 1000,
              [VAR_META_JN_OFFSET]: 0,
          };
}

export function getFilterData({filter, order, searchValues, pageSize, pageNumber}: GetFilterDataType): Object {
    return {
        [VAR_META_JL_FILTER]: filter,
        [VAR_META_JL_SORT]: [order],
        ...pickBy(searchValues, (value) => value !== ""),
        ...getPageFilter(pageSize, pageNumber),
    };
}

export function attachGlobalStore({bc, json, globalValues}: AttachGlobalStore): void {
    if (bc.getglobaltostore && globalValues) {
        forEach(findGetGlobalKey(bc.getglobaltostore), (globaleKey, fieldName) => {
            if (typeof json.filter[fieldName] === "undefined") {
                json.filter[fieldName] = globalValues.get(globaleKey);
            }
        });
    }
}

export function setMask(noglobalmask?: string, pageStore?: PageModelType, isLoading: boolean) {
    if (noglobalmask !== "true" && pageStore) {
        pageStore.setLoadingAction(isLoading);
    }
}

export function checkPageNumber(recordsStore: RecordsModelInstanceType, master: Object) {
    if (!isEqual(master, recordsStore.jsonMaster)) {
        recordsStore.jsonMaster = master;
        recordsStore.pageNumber = 0;
    }
}

export const getAttachedRecords = (records: Array<Object>, newRecord?: Object) => {
    if (newRecord) {
        const firstRecord = records[0] || {};
        const recordIndex = records.findIndex((rec) => rec[VAR_RECORD_ID] === newRecord[VAR_RECORD_ID]);
        const record = {...newRecord, jnTotalCnt: firstRecord.jnTotalCnt};

        if (recordIndex === -1) {
            return [record, ...records];
        }

        return [...records.slice(0, recordIndex), record, ...records.slice(recordIndex + 1)];
    }

    return records;
};

export function prepareRequst(
    recordsStore: RecordsModelInstanceType,
    {bc, status, selectedRecordId}: LoadRecordsActionType,
) {
    const {idproperty = "ck_id", noglobalmask} = bc;
    const globalValues = get(recordsStore.pageStore, "globalValues");
    const master = getMasterData(
        getMasterObject(bc[VAR_RECORD_MASTER_ID], recordsStore.pageStore),
        idproperty,
        globalValues,
    );
    const filterData =
        status === "attach"
            ? {
                  filter: [],
                  order: recordsStore.order,
                  pageNumber: 0,
                  pageSize: 1,
                  searchValues: {[VAR_RECORD_ID]: selectedRecordId},
              }
            : {
                  filter: recordsStore.filter,
                  order: recordsStore.order,
                  pageNumber: recordsStore.pageNumber,
                  pageSize: recordsStore.pageSize,
                  searchValues: recordsStore.searchValues,
              };

    checkPageNumber(recordsStore, master);

    const json = {
        filter: getFilterData(filterData),
        master,
    };

    attachGlobalStore({bc, globalValues, json});

    setMask(noglobalmask, recordsStore.pageStore, true);

    return {json};
}

function loadRecordsResolve(noglobalmask: string) {
    setMask(noglobalmask, this.pageStore, false);
    this.isLoading = false;

    return this.selectedRecord;
}

// eslint-disable-next-line max-lines-per-function
export function loadRecordsAction({
    bc,
    applicationStore,
    selectedRecordId,
    status,
    isUserReload = false,
}: LoadRecordsActionType): Promise<*> {
    const {noglobalmask, defaultvalue, reloadservice} = bc;
    const isWaiting = bc[VAR_RECORD_MASTER_ID] || bc.getglobaltostore;
    const resolve = loadRecordsResolve.bind(this);

    this.isLoading = true;

    return Promise.resolve()
        .then(() => {
            if (!isWaiting) {
                return true;
            }

            return sleep(WAIT_TIME).then(
                () => new CheckLoading({bc, masterId: bc[VAR_RECORD_MASTER_ID], pageStore: this.pageStore}),
            );
        })
        .catch(() => {
            logger(
                i18next.t("344bbb5fb4a84d89b93c448a5c29e1d7", {query: bc[VAR_RECORD_QUERY_ID], timeout: CYCLE_TIMEOUT}),
            );
        })
        .then(() => {
            const {json} = prepareRequst(this, {applicationStore, bc, selectedRecordId, status});

            if (reloadservice === "true" && this.prevFetchJson && isEqual(this.prevFetchJson, json)) {
                return resolve(noglobalmask);
            }
            this.prevFetchJson = json;

            return sendRequestList({
                [META_PAGE_OBJECT]: bc[VAR_RECORD_PAGE_OBJECT_ID],
                action: "sql",
                json,
                plugin: bc.extraplugingate,
                query: bc[VAR_RECORD_QUERY_ID],
                session: applicationStore.session,
                timeout: bc.timeout,
            });
        })
        .then((response) => {
            if (
                snackbarStore.checkValidResponseAction(
                    response[0],
                    this.pageStore && this.pageStore.route,
                    undefined,
                    applicationStore,
                )
            ) {
                const records = (response || []).map((record) => {
                    if (!record[VAR_RECORD_ID] && isEmpty(record[VAR_RECORD_ID])) {
                        record[VAR_RECORD_ID] = `auto-${uuidv4()}`;
                    }

                    return record;
                });

                if (bc.pagesize && records[0] && !records[0].jnTotalCnt) {
                    snackbarStore.snackbarOpenAction(
                        {
                            status: "error",
                            text: i18next.t("44e3485c6b0c47dc8a0792c90af62962"),
                        },
                        this.pageStore && this.pageStore.route,
                    );
                }

                return records;
            }

            return [];
        })
        .catch((response) => {
            snackbarStore.checkExceptResponse(response, this.pageStore && this.pageStore.route, this.applicationStore);

            return [];
        })
        .then((records) => {
            const valueField = status === "attach" ? VAR_RECORD_ID : this.valueField;
            let isDefault = false;
            let recordId = null;

            switch (true) {
                case defaultvalue === VALUE_SELF_ALWAYSFIRST:
                    isDefault = true;
                    recordId = records[0] ? records[0][valueField] : null;
                    break;
                case !isUndefined(selectedRecordId):
                    recordId = selectedRecordId;
                    break;
                case !isUndefined(this.selectedRecordId):
                    recordId = this.selectedRecordId;
                    break;
                case defaultvalue === VALUE_SELF_FIRST:
                    isDefault = true;
                    recordId = records[0] ? records[0][valueField] : null;
                    break;
                default:
                    recordId = null;
            }

            this.recordsState = {
                defaultValueSet: isDefault && !isEmpty(recordId) ? defaultvalue : undefined,
                isUserReload,
                records: status === "attach" ? getAttachedRecords(this.recordsState.records, records[0]) : records,
                status,
            };
            this.recordsAll = this.recordsState.records;

            return this.setSelectionAction(recordId, valueField);
        })
        .then(() => resolve(noglobalmask));
}
