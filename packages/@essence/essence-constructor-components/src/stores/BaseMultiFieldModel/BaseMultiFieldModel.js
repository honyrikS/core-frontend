// @flow
import {extendObservable} from "mobx";
import {
    VALUE_SELF_ALWAYSFIRST,
    VAR_RECORD_PAGE_OBJECT_ID,
    VAR_RECORD_QUERY_ID,
} from "@essence/essence-constructor-share/constants";
import {type PageModelType} from "../PageModel";
import {type RecordsModelType, RecordsModel} from "../RecordsModel";
import {StoreBaseModel} from "../StoreBaseModel";
import {type ModelInterface, type PropsType} from "./BaseMultiFieldModelType";

export class BaseMultiFieldModel extends StoreBaseModel implements ModelInterface {
    recordsStore: RecordsModelType;

    selectedRecord: ?Object;

    pageStore: PageModelType;

    bc: Object;

    isLoading: boolean;

    _isLoading: boolean;

    constructor({bc, pageStore, [VAR_RECORD_QUERY_ID]: query}: PropsType) {
        super({bc, pageStore});

        const config = {
            [VAR_RECORD_PAGE_OBJECT_ID]: bc[VAR_RECORD_PAGE_OBJECT_ID],
            [VAR_RECORD_QUERY_ID]: query,
            defaultvalue: VALUE_SELF_ALWAYSFIRST,
            orderdirection: "",
            orderproperty: "",
        };

        this.recordsStore = new RecordsModel(config, pageStore);
        this.pageStore = pageStore;
        this.bc = bc;

        extendObservable(this, {
            _isLoading: false,
            get isLoading() {
                return this.recordsStore.isLoading || this._isLoading;
            },
            get selectedRecord() {
                return this.recordsStore.selectedRecord;
            },
        });
    }
}
