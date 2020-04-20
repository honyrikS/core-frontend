import {StoreBaseModel, RecordsModel} from "@essence-community/constructor-share/models";
import {IRecordsModel, IStoreBaseModelProps} from "@essence-community/constructor-share/types";
import {VALUE_SELF_ALWAYSFIRST} from "@essence-community/constructor-share/constants";
import {computed} from "mobx";

export class ServiceHiddenModel extends StoreBaseModel {
    recordsStore: IRecordsModel;

    @computed get selectedRecord() {
        return this.recordsStore.selectedRecord;
    }

    constructor(props: IStoreBaseModelProps) {
        super(props);

        this.recordsStore = new RecordsModel(
            {
                defaultvalue: VALUE_SELF_ALWAYSFIRST,
                ...props.bc,
            },
            {
                applicationStore: props.applicationStore,
                pageStore: props.pageStore,
            },
        );
    }

    reloadStoreAction = () => this.recordsStore.loadRecordsAction({});

    clearStoreAction = () => this.recordsStore.clearChildsStoresAction();
}
