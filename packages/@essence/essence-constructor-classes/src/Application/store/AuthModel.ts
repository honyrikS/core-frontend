import {observable, action} from "mobx";
import {History} from "history";
import {
    getFromStore,
    saveToStore,
    noop,
    snackbarStore,
    IAuthModel,
    IApplicationModel,
    loggerRoot,
} from "@essence/essence-constructor-share";
import {request} from "@essence/essence-constructor-share/request";
import {IAuthSession} from "./AuthModel.types";

const logger = loggerRoot.extend("AuthModel");

export class AuthModel implements IAuthModel {
    @observable userInfo = getFromStore<Partial<IAuthSession>>("auth", {}) || {};

    // eslint-disable-next-line no-useless-constructor
    constructor(public applicationStore: IApplicationModel) {}

    checkAuthAction = action("checkAuthAction", (history: History) =>
        request({
            action: "sql",
            query: "GetSessionData",
        })
            // @ts-ignore
            .then((response: IAuthSession) => {
                // @ts-ignore
                if (response && snackbarStore.checkValidLoginResponse(response)) {
                    this.successLoginAction(response, history);
                }
            })
            .catch(noop),
    );

    loginAction = action(
        "loginAction",
        (authValues: Record<string, string>, history: History, responseOptions: Partial<IAuthSession> = {}) =>
            request({
                action: "auth",
                body: authValues,
                query: "Login",
            })
                .then((response) => {
                    if (snackbarStore.checkValidLoginResponse(Array.isArray(response) ? response[0] : response)) {
                        this.successLoginAction(
                            {
                                // @ts-ignore
                                ...(response as IAuthSession),
                                ...responseOptions,
                            },
                            history,
                        );
                    }
                })
                .catch((error: any) => {
                    snackbarStore.checkExceptResponse(error, undefined, this.applicationStore);
                    this.applicationStore.logoutAction();
                    this.userInfo = {};
                }),
    );

    successLoginAction = action("successLoginAction", (response: IAuthSession, history: History) => {
        const {state: {backUrl = "/"} = {}} = history.location;

        this.userInfo = response;
        this.applicationStore.setSesssionAction(response);
        // TODO: сделать проверку на bc, что бы не сохранять пользователя при репортах
        saveToStore("auth", response);
        history.push(backUrl);
    });

    changeUserInfo = action("changeUserInfo", (userInfo: Partial<IAuthSession>) => {
        this.userInfo = {
            ...this.userInfo,
            ...userInfo,
        };
        saveToStore("auth", this.userInfo);
    });

    logoutAction = action("logoutAction", () => {
        return request({
            action: "auth",
            query: "Logout",
            session: this.userInfo.session,
        })
            .then(() => {
                this.userInfo = {};
            })
            .catch((err) => {
                logger(err);
                this.userInfo = {};
            });
    });
}
