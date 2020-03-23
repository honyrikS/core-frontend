import axios from "axios";
import {isArray, isString} from "lodash";
import {stringify} from "qs";
import {settingsStore} from "../../models";
import {VAR_SETTING_GATE_URL, META_OUT_RESULT, META_PAGE_OBJECT} from "../../constants";
import {i18next} from "../../utils";
import {IBaseRequest} from "./baseRequest.types";

const MILLISEC = 1000;

axios.defaults.timeout = 30000;
axios.defaults.baseURL = "/";

interface ICheckError {
    responseAllData: any;
    query: string;
    responseData: any[];
    list?: boolean;
}

interface IParseResponse {
    responseData: any[];
    list?: boolean;
}

const checkError = ({responseAllData, query, responseData, list}: ICheckError) => {
    let isError = false;

    if (responseAllData.success !== true && responseAllData.success !== "true") {
        isError = true;
    }

    if (list && !isArray(responseData)) {
        isError = true;
    }

    if (isError) {
        const error = new Error(i18next.t("static:63538aa4bcd748349defdf7510fc9c10"));

        // @ts-ignore
        error.query = query;
        // @ts-ignore
        error.responseError = responseAllData;

        throw error;
    }
};

const parseResponse = ({responseData, list}: IParseResponse) => {
    if (list) {
        return responseData;
    }

    const [responseSingleData] = responseData;

    if (responseSingleData && isString(responseSingleData.result)) {
        return JSON.parse(responseSingleData.result);
    }

    return responseSingleData;
};

export const baseAxiosRequest = async (props: IBaseRequest) => {
    const {
        json,
        query = "",
        action = "dml",
        [META_PAGE_OBJECT]: pageObjectName = "",
        session,
        body,
        list,
        onUploadProgress,
        plugin,
        timeout = "30",
        gate = settingsStore.settings[VAR_SETTING_GATE_URL],
        method = "POST",
        formData,
        params,
    } = props;
    const queryParams = {
        action: formData ? "upload" : action,
        plugin,
        query,
    };
    const data = {
        [META_OUT_RESULT]: "",
        [META_PAGE_OBJECT]: pageObjectName.replace(
            // eslint-disable-next-line prefer-named-capture-group, no-useless-escape
            /^.*?[{(]?([0-9A-F]{8}[-]?([0-9A-F]{4}[-]?){3}[0-9A-F]{12})[\)\}]?.*?$/giu,
            "$1",
        ),
        json: json ? JSON.stringify(json) : undefined,
        session,
        ...body,
    };

    // @ts-ignore
    const response = await axios({
        data: formData ? formData : stringify(data),
        headers: {
            "Content-type": "application/x-www-form-urlencoded",
        },
        method,
        onUploadProgress,
        params,
        timeout: parseInt(timeout, 10) * MILLISEC,
        url: `${gate}?${stringify(formData ? {...queryParams, ...data} : queryParams)}`,
    });

    const responseAllData: any = response.data;
    const responseData = responseAllData.data;

    checkError({list, query, responseAllData, responseData});

    return parseResponse({list, responseData});
};
