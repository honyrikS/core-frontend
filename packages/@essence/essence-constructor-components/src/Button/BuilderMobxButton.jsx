/* eslint max-lines: ["error", 500]*/
// @flow
import * as React from "react";
import noop from "lodash/noop";
import {compose} from "recompose";
import {withStyles} from "@material-ui/core/styles";
import {Button, IconButton} from "@material-ui/core";
import Fab from "@material-ui/core/Fab";
import {setComponent, Icon} from "@essence/essence-constructor-share";
import {withTranslation, WithT} from "@essence/essence-constructor-share/utils";
import commonDecorator, {type CommonDecoratorInjectType} from "../decorators/commonDecorator";
import {styleTheme} from "../constants";
import {isEmpty} from "../utils/base";
import {makeRedirect} from "../utils/redirect";
import {FileInputModel} from "../stores/FileInputModel";
import FileInput from "../FileInput/FileInput";
import WindowMessageButton from "../WindowMessage/WindowMessageButton";
import {type ButtonPropsType, type ButtonConfigType} from "./ButtonTypes";
import styles from "./BuilderMobxButtonStyles/BuilderMobxButtonStyles";

const DEFAULT_HANDLER = "defaultHandlerBtnAction";

type StateType = {|
    Component: React.ComponentType<*>,
    color: string,
    disabledState: boolean,
    fileInputStore: ?FileInputModel,
    windowTitle: string,
    onlyicon: boolean,
    qtip: string,
|};
type OwnPropsType = {
    classes?: Object,
    isEscOpen?: boolean,
    styleTheme: string,
    performData: (bc: ButtonConfigType) => ?Object,
};
type PropsType = ButtonPropsType & CommonDecoratorInjectType & OwnPropsType & WithT;

export const popoverProps = {
    right: {
        focusableMount: true,
        hideBackdrop: false,
        restoreFocusedElement: true,
        transformOrigin: {
            horizontal: -14,
            vertical: "center",
        },
    },
    top: {
        anchorOrigin: {
            horizontal: "center",
            vertical: "top",
        },
        focusableMount: true,
        hideBackdrop: false,
        restoreFocusedElement: true,
        transformOrigin: {
            horizontal: "center",
            vertical: "bottom",
        },
    },
};

const getColor = (uitype, defaultColor) => {
    switch (uitype) {
        case "1":
            return "primary";
        case "2":
            return "secondary";
        default:
            return defaultColor;
    }
};

const getHandlerBtn = (bc: ButtonConfigType) => {
    if (bc.handler === "false" || isEmpty(bc.handler)) {
        return isEmpty(bc.updatequery) ? DEFAULT_HANDLER : "updateBtnAction";
    }

    return bc.handler;
};

export class BuilderMobxButtonBase extends React.Component<PropsType, StateType> {
    static defaultProps = {
        color: "primary",
        onClick: noop,
        performData: noop,
        preventFocus: true,
        styleTheme,
    };

    handlerButtonClick: (event: SyntheticEvent<*>) => void | Promise<any>;

    _isMounted: boolean = false;

    constructor(...args: Array<*>) {
        super(...args);

        const {bc, color, component} = this.props;
        const {tipmsg, cvDisplayed, confirmquestion, mode, uitype, handlerFn} = bc;

        const onlyicon: boolean = isEmpty(this.props.onlyicon) ? bc.onlyicon === "true" : Boolean(this.props.onlyicon);

        this.handlerButtonClick = handlerFn || this.handleClick;

        this.state = {
            Component: component || Button,
            color: onlyicon ? color : getColor(uitype, color),
            disabledState: false,
            fileInputStore:
                mode === "8"
                    ? new FileInputModel({
                          bc,
                          pageStore: this.props.pageStore,
                      })
                    : null,
            onlyicon,
            qtip: tipmsg || cvDisplayed,
            windowTitle: confirmquestion || "5a33b10058114ae7876067447fde8242",
        };
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    // eslint-disable-next-line max-statements
    handleClickDefer = (event: SyntheticEvent<HTMLButtonElement>) => {
        const {handleClick, pageStore, bc, onClick = noop, disabled, record} = this.props;
        const {disabledState} = this.state;
        const {redirecturl, redirectusequery, columnsfilter} = bc;

        if (disabled || disabledState) {
            return null;
        }

        if (handleClick) {
            return handleClick(event);
        }

        if ((redirecturl || redirectusequery) && columnsfilter) {
            return makeRedirect({...bc, columnsfilter, redirecturl, redirectusequery}, pageStore, record);
        }

        onClick(event);

        if (this.state.fileInputStore) {
            return this.state.fileInputStore.initFileChooseAwait((files: File[]) =>
                this.handleMode({
                    files,
                }),
            );
        }

        return this.handleMode();
    };

    // eslint-disable-next-line max-statements
    handleMode = (data: any = {}) => {
        const {pageStore, bc, performData} = this.props;
        const {ckMaster, ckParent, mode} = bc;
        let promise = null;
        const handlerBtn = getHandlerBtn(bc);

        for (const ckPageObjectMain of [ckMaster, ckParent]) {
            if (ckPageObjectMain) {
                const builderStore = pageStore.stores.get(ckPageObjectMain);

                if (builderStore) {
                    if (builderStore.handlers && typeof builderStore.handlers[handlerBtn] === "function") {
                        promise = builderStore.handlers[handlerBtn](mode, bc, {...data, ...performData(bc)});
                        break;
                    }

                    // @deprecated
                    if (typeof builderStore[handlerBtn] === "function") {
                        promise = builderStore[handlerBtn](mode, bc, {...data, ...performData(bc)});
                        break;
                    }
                }
            }
        }

        if (promise instanceof Promise) {
            this.setState({disabledState: true});

            return promise.then((res: any) => {
                if (this._isMounted) {
                    this.setState({disabledState: false});
                }

                return res;
            });
        }

        return Promise.resolve(null);
    };

    handleClick = (event: SyntheticEvent<HTMLButtonElement>) =>
        Promise.resolve().then(() => this.handleClickDefer(event));

    setDisabled = (disabledState: boolean) =>
        this.setState({
            disabledState,
        });

    handleClickAccept = (event: SyntheticEvent<HTMLButtonElement>) => {
        event.stopPropagation();

        this.handleClickDefer(event);
    };

    handleMouseDown = (event: SyntheticEvent<HTMLElement>) => {
        // Prever focus after click
        if (this.props.preventFocus) {
            event.preventDefault();
        }
    };

    renderIconOnlyLight = () => {
        // eslint-disable-next-line id-length
        const {disabled, readOnly, className, componentProps, tabIndex, t} = this.props;
        const {color, disabledState, qtip} = this.state;
        const {ckPageObject, iconfont, iconfontname, iconsize} = this.props.bc;
        const button = (
            <IconButton
                onClick={this.handlerButtonClick}
                disableRipple
                disabled={readOnly || disabledState || disabled}
                color={color}
                data-page-object={ckPageObject}
                data-qtip={t(qtip)}
                className={className}
                onMouseDown={this.handleMouseDown}
                tabIndex={tabIndex}
                {...componentProps}
            >
                {iconfont ? (
                    <Icon iconfont={iconfont} iconfontname={iconfontname} size={iconsize} color="inherit" />
                ) : null}
            </IconButton>
        );

        return this.renderWithWindowMessage(button);
    };

    renderIconOnlyDark = () => {
        // eslint-disable-next-line id-length
        const {variant, disabled, readOnly, className, componentProps, tabIndex, t} = this.props;
        const {ckPageObject, iconfont, iconfontname, iconsize} = this.props.bc;
        const {disabledState, qtip} = this.state;
        const buttonProps = {
            className,
            color: this.state.color,
            "data-page-object": ckPageObject,
            "data-qtip": t(qtip),
            disableRipple: true,
            disabled: readOnly || disabledState || disabled,
            onClick: this.handlerButtonClick,
            onMouseDown: this.handleMouseDown,
            tabIndex,
            ...componentProps,
        };
        const icon = iconfont ? (
            <Icon iconfont={iconfont} iconfontname={iconfontname} size={iconsize} color="inherit" />
        ) : null;
        const button =
            variant === "fab" ? (
                <Fab {...buttonProps} size="small">
                    {icon}
                </Fab>
            ) : (
                <IconButton {...buttonProps}>{icon}</IconButton>
            );

        return this.renderWithWindowMessage(button);
    };

    renderButton = () => {
        // eslint-disable-next-line id-length
        const {disabled, classNameIcon, readOnly, className, componentProps, classes = {}, t, tabIndex} = this.props;
        const {Component, disabledState} = this.state;
        const {iconfont, iconfontname, cvDisplayed, ckPageObject, tipmsg, iconsize} = this.props.bc;
        const qtip = tipmsg || cvDisplayed;
        const button = (
            <Component
                color={this.state.color}
                data-qtip={t(qtip)}
                onClick={this.handlerButtonClick}
                disabled={readOnly || disabledState || disabled}
                disableRipple
                variant="contained"
                data-page-object={ckPageObject}
                className={className}
                onMouseDown={this.handleMouseDown}
                tabIndex={tabIndex}
                {...componentProps}
            >
                {iconfont ? (
                    <Icon
                        iconfont={iconfont}
                        iconfontname={iconfontname}
                        size={iconsize}
                        color="inherit"
                        className={classNameIcon}
                    />
                ) : null}
                {iconfont ? "\u00A0" : null}
                <span className={classes.textOverflow}>{t(cvDisplayed)}</span>
            </Component>
        );

        return this.renderWithWindowMessage(button);
    };

    renderWithWindowMessage = (button: React.Node) => {
        const {disabled, pageStore, bc} = this.props;
        const {mode, confirmquestion, confirmquestionposition = "right"} = this.props.bc;
        const {windowTitle} = this.state;

        if (mode === "4" || mode === "7" || confirmquestion) {
            return (
                <WindowMessageButton
                    disabled={disabled}
                    onClickAccept={this.handleClickAccept}
                    textWindow={windowTitle}
                    popover
                    popoverProps={popoverProps[confirmquestionposition]}
                    pageStore={pageStore}
                    ckPageObject={`${bc.ckPageObject}-button`}
                    visible
                    isEscOpen={this.props.isEscOpen}
                >
                    {button}
                </WindowMessageButton>
            );
        }

        return button;
    };

    renderContent = () => {
        const {children, disabled, readOnly} = this.props;
        const {disabledState, onlyicon} = this.state;

        if (children) {
            return React.Children.map(children, (child) =>
                React.cloneElement(child, {
                    disabled: readOnly || disabledState || disabled,
                    onClick: this.handlerButtonClick,
                }),
            );
        }

        if (onlyicon) {
            return this.props.styleTheme === "light" ? this.renderIconOnlyLight() : this.renderIconOnlyDark();
        }

        return this.renderButton();
    };

    render() {
        const {bc, classes = {}, hidden, highlight} = this.props;

        if (hidden) {
            return null;
        }

        return (
            <div className={classes.btnContainer}>
                {this.renderContent()}
                {this.state.fileInputStore ? <FileInput store={this.state.fileInputStore} mode={bc.filemode} /> : null}
                {highlight ? <span className={classes.highlight}>*</span> : null}
            </div>
        );
    }
}

const BuilderMobxButton = compose(
    commonDecorator,
    withTranslation("meta"),
    withStyles(styles),
)(BuilderMobxButtonBase);

setComponent("BTN", BuilderMobxButton);

export default BuilderMobxButton;
