import * as React from "react";
import {inject} from "mobx-react";
import {VAR_RECORD_CV_TOKEN} from "@essence/essence-constructor-share/constants";

const mapStoresToProps = (stores) => ({
    authStore: stores.authStore,
});

export const FramePage = (props) => {
    const {authStore, history} = props;
    const {session, token, app, pageId} = props.match.params;

    React.useEffect(() => {
        history.replace(history.location.pathname, {backUrl: `/${app}/${pageId}`});
        const loginByToken = async () => {
            await authStore.loginAction(
                {
                    [VAR_RECORD_CV_TOKEN]: token,
                },
                history,
            );

            // If not logger change bach url to page instead of return to back frame page
            if (!authStore.userInfo.session) {
                history.replace(history.location.pathname, {backUrl: `/${app}/${pageId}`});
            }
        };

        if (session) {
            authStore.successLoginAction(
                {
                    session,
                },
                history,
            );
        } else if (token) {
            loginByToken();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
};

export default inject(mapStoresToProps)(FramePage);
