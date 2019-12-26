import {stringify} from "qs";
import {IRequest, IRequestCheckError} from "../types";
import {settingsStore} from "../models";
import {i18next} from "../utils";
import {IRecord} from "../types/Base";
import {VAR_SETTING_GATE_URL, META_OUT_RESULT, META_PAGE_OBJECT} from "../constants";
import {ResponseError} from "./error";

const MILLISECOND = 1000;

const checkError = ({responseJSON, query, list}: IRequestCheckError) => {
    let isError = false;

    if (responseJSON.success !== true && responseJSON.success !== "true") {
        isError = true;
    }

    if (list && !Array.isArray(responseJSON.data)) {
        isError = true;
    }

    if (isError) {
        throw new ResponseError(i18next.t("static:63538aa4bcd748349defdf7510fc9c10"), responseJSON, query);
    }
};

const parseResponse = ({responseJSON, list}: IRequestCheckError) => {
    const {data} = responseJSON;

    if (list) {
        return data;
    }

    const responseSingleData = Array.isArray(data) ? data[0] : undefined;

    if (responseSingleData && typeof responseSingleData.result === "string") {
        return JSON.parse(responseSingleData.result);
    }

    return responseSingleData;
};

export const request = async <R = IRecord | IRecord[]>({
    json,
    query = "",
    action = "dml",
    [META_PAGE_OBJECT]: pageObjectName = "",
    session,
    body,
    list = true,
    plugin,
    timeout = "30",
    gate = settingsStore.settings[VAR_SETTING_GATE_URL],
    method = "POST",
    formData,
}: IRequest): Promise<R> => {
    const queryParams = {
        action,
        plugin,
        query,
    };
    const data = {
        [META_OUT_RESULT]: "",
        [META_PAGE_OBJECT]: pageObjectName.replace(
            // eslint-disable-next-line prefer-named-capture-group
            /^.*?[{(]?([0-9A-F]{8}[-]?([0-9A-F]{4}[-]?){3}[0-9A-F]{12})[)}]?.*?$/giu,
            "$1",
        ),
        json: json ? JSON.stringify(json) : undefined,
        session,
        ...(body ? body : {}),
    };
    const url = `${gate}?${stringify(formData ? {...queryParams, ...data} : queryParams)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), parseInt(timeout, 10) * MILLISECOND);

    const response = await fetch(url, {
        body: formData ? formData : stringify(data),
        headers: {
            "Content-type": "application/x-www-form-urlencoded",
        },
        method,
        signal: controller.signal,
    });

    /*
     * TODO: Реализовать onUploadProgress
     * if (onUploadProgress) {
     *     const reader = response.body.getReader();
     *     while (true) {
     *         const result = await reader.read();
     *         onUploadProgress(result);
     *         if (result.done) {
     *             break;
     *         }
     *     }
     * }
     */

    clearTimeout(timeoutId);

    const responseJSON = await response.json();

    checkError({list, query, responseJSON});

    return parseResponse({list, query, responseJSON});
};
