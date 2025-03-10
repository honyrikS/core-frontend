import * as React from "react";
import {reaction} from "mobx";
import {IClassProps, FieldValue} from "@essence-community/constructor-share/types";
import {Popover} from "@essence-community/constructor-share/uicomponents";
import {
    useModel,
    useFieldGetGlobal,
    useFieldSetGlobal,
    useDefaultValueQuery,
} from "@essence-community/constructor-share/hooks";
import {useTranslation, isEmpty, toString} from "@essence-community/constructor-share/utils";
import {IPopoverChildrenProps} from "@essence-community/constructor-share/uicomponents/Popover/Popover.types";
import {useField} from "@essence-community/constructor-share/Form";
import {VALUE_SELF_FIRST, VALUE_SELF_ALWAYSFIRST} from "@essence-community/constructor-share/constants";
import {FieldComboList} from "../components/FieldComboList";
import {FieldComboInput} from "../components/FieldComboInput";
import {CLEAR_VALUE, FieldComboModel} from "../store/FieldComboModel";
import {getFirstValues} from "../utils/getFirstValues";

/**
 * How it should work:
 * 1. Value can get from recordsStore
 * 2. can be changed from props.value
 */
// eslint-disable-next-line max-statements, max-lines-per-function
export const FieldComboContainer: React.FC<IClassProps> = (props) => {
    const {bc, pageStore, disabled, hidden} = props;
    const {i18n} = useTranslation();
    const inputRef: React.MutableRefObject<HTMLInputElement | null> = React.useRef(null);
    const listRef: React.MutableRefObject<HTMLInputElement | null> = React.useRef(null);
    const textFieldRef: React.MutableRefObject<HTMLDivElement | null> = React.useRef(null);
    const field = useField({bc, clearValue: CLEAR_VALUE, disabled, hidden, pageStore});
    const [store] = useModel((modelProps) => new FieldComboModel(modelProps), {field, ...props});
    const [focused, setFocused] = React.useState(false);

    const popoverContent = (popoverProps: IPopoverChildrenProps) => (
        <FieldComboList
            store={store}
            bc={props.bc}
            inputRef={inputRef}
            value={field.value}
            onChange={field.onChange}
            listRef={listRef}
            {...popoverProps}
            focused={focused}
        />
    );

    const handleChangeOpen = React.useCallback(
        (open: boolean) => {
            if (open === false && !props.bc.allownew) {
                store.handleSetValue(field.value, false, false);
            }
        },
        [props.bc.allownew, store, field],
    );

    const handleReactValue = React.useCallback(
        (value: FieldValue) => {
            if (bc.allownew && value === bc.allownew) {
                field.onClear();
            } else if (isEmpty(value)) {
                store.resetAction();
            } else if (
                !store.recordsStore.isLoading &&
                (value === VALUE_SELF_FIRST || value === VALUE_SELF_ALWAYSFIRST) &&
                value === bc.defaultvalue &&
                (store.recordsStore.loadCounter || store.recordsStore.records.length)
            ) {
                const val = getFirstValues(store.recordsStore);

                field.onChange(val);
                store.handleSetValue(val, false, false);
            } else {
                store.handleSetValue(value, false, false);
            }
        },
        [bc.allownew, bc.defaultvalue, field, store],
    );

    useFieldGetGlobal({bc, field, pageStore, store});
    useFieldSetGlobal({bc, field, pageStore, store});
    useDefaultValueQuery({bc, field, pageStore});

    // TODO: call this method before loading in the useModel
    React.useLayoutEffect(() => {
        if (!isEmpty(field.value) && !store.recordsStore.isLoading) {
            handleReactValue(field.value);
        }

        return reaction(() => field.value, handleReactValue);
    }, [field, handleReactValue, store]);
    React.useEffect(
        () =>
            reaction(
                () => store.suggestions,
                (sugs) => {
                    if (sugs.length === 0) {
                        return;
                    }
                    const recordsState = store.recordsStore.recordsState;
                    const isDefault = Boolean(
                        (isEmpty(field.value) && (store.recordsStore.loadCounter <= 1 || bc.records?.length)) ||
                            field.value === bc.defaultvalue ||
                            (recordsState.isDefault &&
                                (field.value === VALUE_SELF_ALWAYSFIRST || field.value === VALUE_SELF_FIRST)),
                    );
                    const value = recordsState.record ? recordsState.record[store.valuefield] : field.value;

                    if (isDefault) {
                        field.onChange(
                            value === VALUE_SELF_ALWAYSFIRST || value === VALUE_SELF_FIRST || isEmpty(value)
                                ? CLEAR_VALUE
                                : value,
                        );
                        store.handleSetValue(value, false, false);

                        return;
                    }
                    const stringValue = toString(field.value);
                    const suggestion = sugs.find((sug) => sug.value === stringValue);

                    if (!suggestion && value !== store.lastValue) {
                        field.onChange(value);
                    } else {
                        store.handleSetValue(field.value, false, false);
                    }
                },
            ),
        [bc.defaultvalue, field, store],
    );

    React.useEffect(() => {
        if (props.bc.localization && i18n.language) {
            store.handleChangeLanguage(field.value, i18n.language);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [i18n.language, props.bc.localization]);

    const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {relatedTarget} = event;

        if (relatedTarget instanceof Node) {
            const isFocus = [listRef.current, textFieldRef.current].some((el: HTMLDivElement | null) => {
                return el && el.contains(relatedTarget);
            });

            if (!isFocus && store.isInputChanged) {
                store.handleSetValue(field.value, false, false);
            }
        }
    };

    return (
        <Popover
            popoverContent={popoverContent}
            container={props.pageStore.pageEl}
            pageStore={props.pageStore}
            hideOnScroll
            onChangeOpen={handleChangeOpen}
            disableFocusableArrow
        >
            <FieldComboInput
                {...props}
                store={store}
                inputRef={inputRef}
                textFieldRef={textFieldRef}
                field={field}
                onBlur={handleBlur}
                focused={focused}
                setFocused={setFocused}
            />
        </Popover>
    );
};
