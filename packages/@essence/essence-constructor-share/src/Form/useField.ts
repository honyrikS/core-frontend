import {useMemo, useContext, useEffect, useCallback} from "react";
import uniqueId from "lodash/uniqueId";
import {reaction} from "mobx";
import {IBuilderConfig, IPageModel, FieldValue} from "../types";
import {FormContext, ParentFieldContext} from "../context";
import {VAR_RECORD_MASTER_ID, VAR_RECORD_CL_IS_MASTER, VAR_RECORD_PAGE_OBJECT_ID} from "../constants";
import {isEmpty} from "../utils";
import {IField, IRegisterFieldOptions} from "./types";

interface IUseFieldProps {
    bc: IBuilderConfig;
    pageStore: IPageModel;
    isArray?: boolean;
    isObject?: boolean;
    output?: IRegisterFieldOptions["output"];
    input?: IRegisterFieldOptions["input"];
    disabled?: boolean;
    hidden?: boolean;
}

export const useField = ({bc, pageStore, output, input, isArray, disabled, hidden}: IUseFieldProps): IField => {
    const form = useContext(FormContext);
    const parentField = useContext(ParentFieldContext);
    const key = useMemo(() => {
        const columnKey = bc.column || uniqueId("builderField");

        if (parentField) {
            return `${parentField.key}.${columnKey}`;
        }

        return columnKey;
    }, [bc.column, parentField]);
    const [field, isRegisted] = useMemo(() => {
        const existedField = form.select(key);

        if (existedField) {
            return [existedField, false];
        }

        return [
            form.registerField(key, {
                bc,
                input: input || parentField?.input,
                isArray,
                output: output || parentField?.output,
                pageStore,
            }),
            true,
        ];
    }, [bc, form, input, isArray, key, output, pageStore, parentField]);

    const handleReactValue = useCallback(
        (value: FieldValue) => {
            const ckPageObject = bc[VAR_RECORD_PAGE_OBJECT_ID];

            pageStore.addFieldValueMaster(ckPageObject, value);

            pageStore.stores.forEach((store) => {
                if (store && store.bc && store.bc[VAR_RECORD_MASTER_ID] === ckPageObject) {
                    store.reloadStoreAction();
                    store.clearAction && store.clearAction();
                }
            });
        },
        [bc, pageStore],
    );

    useEffect(() => {
        if (bc[VAR_RECORD_CL_IS_MASTER]) {
            const disposer = reaction(() => field.value, handleReactValue, {
                fireImmediately: !isEmpty(field.value),
            });

            return () => {
                disposer();
                pageStore.removeFieldValueMaster(bc[VAR_RECORD_PAGE_OBJECT_ID]);
            };
        }

        return undefined;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [field, handleReactValue]);

    useEffect(() => {
        const masterId = bc[VAR_RECORD_MASTER_ID];

        if (masterId) {
            pageStore.addToMastersAction(masterId, field);

            return () => {
                pageStore.removeFromMastersAction(masterId, field);
            };
        }

        return undefined;
    }, [bc, field, pageStore]);

    useEffect(() => {
        field.setDisabled(disabled);
        field.setHidden(hidden);
    }, [field, disabled, hidden]);

    useEffect(() => {
        if (isRegisted) {
            return () => {
                form.unregisterField(key);
            };
        }

        return undefined;
    }, [form, isRegisted, key]);

    return field;
};
