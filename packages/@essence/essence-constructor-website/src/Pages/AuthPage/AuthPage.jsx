// @flow
import * as React from "react";
import {inject, observer} from "mobx-react";
import {Grid, TextField, Paper, Button, Typography, InputAdornment, IconButton} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import {compose} from "recompose";
import {PageLoader} from "@essence/essence-constructor-share";
import {Icon} from "@essence/essence-constructor-share/Icon";
import {getFromStore, WithT, withTranslation} from "@essence/essence-constructor-share/utils";
import {MobxForm} from "../../Components/MobxForm";
import {AuthModelType} from "../../Stores/AuthModel";
import {type ApplicationModelType} from "../../Stores/ApplicationModel";
import {type StoresType} from "../../Stores/stores";
import AppBarAuth from "../../Components/AppBarAuth";
import {styleTheme} from "../../constants";
import * as lightLogo from "../../images/light_logo.png";
import * as darkLogo from "../../images/dark_logo.png";
import styles from "./AuthPageStyles";

const logo = styleTheme === "light" ? lightLogo : darkLogo;

type StoresPropsType = {
    applicationStore: ApplicationModelType,
    authStore: AuthModelType,
};
type OwnPropsType = {
    classes: {
        [$Keys<$Call<typeof styles>>]: string,
    },
    history?: History,
};
type PropsType = WithT & StoresPropsType & OwnPropsType;

type StateType = {
    loaded: boolean,
    showPassword: boolean,
    form: any,
};
const FIELD_LOGIN_LENGTH = 30;
const FIELD_MAX_LENGTH = 40;
const mapStoresToProps = (stores: StoresType): StoresPropsType => ({
    applicationStore: stores.applicationStore,
    authStore: stores.authStore,
});

class AuthPage extends React.Component<PropsType, StateType> {
    state = {
        form: null,
        loaded: false,
        showPassword: false,
    };

    componentDidMount() {
        this.setState({loaded: true});
        const userInfo = getFromStore("auth", {});
        const {authStore, history} = this.props;

        this.setState({
            form: new MobxForm({
                fields: this.getFieldsConfigs(),
                hooks: {
                    onSuccess: this.handleLogin,
                },
            }),
        });

        if (userInfo.session) {
            authStore.successLoginAction(userInfo, history);
        }

        authStore.checkAuthAction(history);
    }

    handleToggleShowPassword = () => {
        this.setState((prevState: StateType) => ({showPassword: !prevState.showPassword}));
    };

    handleLogin = async (form) => {
        const {authStore, history} = this.props;

        await form.validate({showErrors: true});

        if (form.isValid && authStore) {
            authStore.loginAction(form.values(), history);
        }
    };

    getFieldsConfigs = () => [
        {
            autoFocus: false,
            disabled: false,
            id: "cvLogin",
            margin: "normal",
            name: "cvLogin",
            placeholder: this.props.t("d016a5a3d0964cd69fd15c6e283db77e"),
            rules: "required",
            title: this.props.t("d016a5a3d0964cd69fd15c6e283db77e"),
        },
        {
            autoFocus: false,
            disabled: false,
            id: "cvPassword",
            margin: "normal",
            name: "cvPassword",
            placeholder: this.props.t("8d380b7c5e6d4fcfb9d608d69464fe2a"),
            rules: "required",
            title: this.props.t("8d380b7c5e6d4fcfb9d608d69464fe2a"),
        },
    ];

    renderLoginField = ({input}) => {
        const {classes} = this.props;

        const endAdornment = (
            <InputAdornment position="end" className={classes.inputAdornment}>
                <IconButton
                    color="secondary"
                    className={input.value ? classes.buttonAdorment : classes.buttonAdormentHidden}
                    key="clear-value"
                    onClick={() => {
                        if (input.onChange) {
                            input.onChange("");
                        }
                    }}
                    tabIndex={-1}
                    disableRipple
                >
                    <Icon iconfont="times" size="xs" />
                </IconButton>
            </InputAdornment>
        );

        return (
            <TextField
                {...input}
                className={classes.textField}
                InputProps={{
                    classes: {
                        formControl: classes.formControl,
                        input: classes.inputRoot,
                        root: classes.placeholder,
                        underline: classes.underline,
                    },
                    endAdornment,
                }}
                // eslint-disable-next-line react/jsx-no-duplicate-props
                inputProps={{
                    maxLength: FIELD_LOGIN_LENGTH,
                }}
            />
        );
    };

    // eslint-disable-next-line max-lines-per-function
    renderPasswordField = ({input}) => {
        const {classes} = this.props;
        const {showPassword} = this.state;

        const endAdornment = (
            <InputAdornment position="end" className={classes.inputAdornment}>
                <IconButton
                    color="secondary"
                    className={input.value ? classes.buttonAdorment : classes.buttonAdormentHidden}
                    key="eye-password"
                    onClick={this.handleToggleShowPassword}
                    tabIndex={-1}
                    disableRipple
                >
                    <Icon iconfont={showPassword ? "eye-slash" : "eye"} size="xs" />
                </IconButton>

                <IconButton
                    color="secondary"
                    className={input.value ? classes.buttonAdorment : classes.buttonAdormentHidden}
                    key="clear-value"
                    onClick={() => {
                        input.onChange("");
                    }}
                    tabIndex={-1}
                    disableRipple
                >
                    <Icon iconfont="times" size="xs" />
                </IconButton>
            </InputAdornment>
        );

        return (
            <TextField
                {...input}
                className={classes.textField}
                InputProps={{
                    classes: {
                        formControl: classes.formControl,
                        input: classes.inputRoot,
                        root: classes.placeholder,
                        underline: classes.underline,
                    },
                    endAdornment,
                }}
                // eslint-disable-next-line react/jsx-no-duplicate-props
                inputProps={{
                    maxLength: FIELD_MAX_LENGTH,
                    type: showPassword ? "text" : "password",
                }}
            />
        );
    };

    render() {
        const {classes, applicationStore} = this.props;
        const {form} = this.state;

        if (!form) {
            return null;
        }

        return (
            <React.Fragment>
                {applicationStore.mode === "reports" ? null : <AppBarAuth />}
                <Grid container justify="center" alignItems="center" className="root-height">
                    <Grid item>
                        <Paper classes={{root: classes.paper}} elevation={12}>
                            <Typography variant="body2" classes={{root: classes.typography}}>
                                <img src={logo} alt="logo" height="50" width="50" />
                                {applicationStore.settingsStore.settings.projectAuthTitle}
                            </Typography>
                            <form>
                                <PageLoader
                                    isLoading={form.submitting}
                                    loaderType={applicationStore.settingsStore.settings.projectLoader}
                                />
                                <Grid container direction="column" justyfy="space-between" spacing={3}>
                                    <Grid item>{this.renderLoginField({input: form.$("cvLogin").bind()})}</Grid>
                                    <Grid item>
                                        {this.renderPasswordField({
                                            input: form.$("cvPassword").bind(),
                                        })}
                                    </Grid>
                                    <Grid item>
                                        <Button
                                            type="submit"
                                            onClick={form.onSubmit}
                                            classes={{disabled: classes.disabled, root: classes.button}}
                                            disabled={form.submitting || !form.isValid}
                                            disableRipple
                                        >
                                            {this.props.t("664bdebac78e47079bb685732899c5f6")}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </Paper>
                    </Grid>
                </Grid>
            </React.Fragment>
        );
    }
}

export default compose(inject(mapStoresToProps), withStyles(styles), withTranslation("meta"), observer)(AuthPage);
