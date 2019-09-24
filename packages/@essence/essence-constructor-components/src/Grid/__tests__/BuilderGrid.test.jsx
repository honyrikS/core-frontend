// @flow
import * as React from "react";
import {type ReactWrapper} from "enzyme";
import {camelCaseKeys} from "@essence/essence-constructor-share/utils";
import {TableCell, TableSortLabel} from "@material-ui/core";
import gridMock from "../../../mocks/grid/grid";
import {createEmptyPageStore} from "../../stores";
import {mountWithTheme} from "../../utils/test";
import BuilderFilter from "../../Filter/BuilderFilter";
import {type GridModelType} from "../../stores/GridModel";
import {type PageModelType} from "../../stores/PageModel";
import Pagination from "../../Pagination/Pagination";
import GridRow from "../Row/GridRow";
import BuilderGrid, {BaseBuilderGrid} from "../BuilderGrid";
import {BuilderBaseGridBase} from "../BuilderBaseGrid";
import {type BuilderGridType} from "../BuilderGridType";
import BaseGridTableHeader from "../BaseGridTableHeader";
import {sleep} from "../../utils/base";

type GridPropsType = {
    bc: BuilderGridType,
    visible?: boolean,
};

type MountGridRetunType = {
    store: GridModelType,
    pageStore: PageModelType,
    wrapper: ReactWrapper,
};

const mountGrid = ({bc, visible = true}: GridPropsType): MountGridRetunType => {
    const pageStore = createEmptyPageStore({styleTheme: "dark"});
    const wrapper = mountWithTheme(<BuilderGrid pageStore={pageStore} visible={visible} bc={bc} />);
    const store: GridModelType = wrapper.find(BaseBuilderGrid).prop("store");

    return {pageStore, store, wrapper};
};

// eslint-disable-next-line max-statements
describe("BuilderGrid", () => {
    const gridBc = camelCaseKeys(gridMock);
    const filterBc = {
        childs: [
            {
                ckPageObject: "cv_short_filter_column",
                column: "cv_short",
                cvDisplayed: "Краткое наименование организации",
                cvName: "cv_short",
                datatype: "text",
                type: "IFIELD",
            },
        ],
        ckObject: "filter",
        ckPageObject: "filter",
        ckParent: "grid",
        cvDescription: "Фильтр организаций",
        cvName: "Filters Panel",
        type: "FILTERPANEL",
    };

    it("render grid", () => {
        const {wrapper} = mountGrid({bc: gridBc});

        wrapper.update();

        expect(wrapper.find(BuilderFilter).exists()).toBeFalsy();
        expect(wrapper.exists()).toBeTruthy();

        wrapper.unmount();
    });

    it("render tree grid", () => {
        const {wrapper} = mountGrid({bc: {...gridBc, rootvisible: "true", type: "TREEGRID"}});

        expect(wrapper.find(BuilderFilter).exists()).toBeFalsy();
        expect(wrapper.exists()).toBeTruthy();

        wrapper.unmount();
    });

    it("render filter", () => {
        const {wrapper} = mountGrid({bc: {...gridBc, filters: [filterBc]}});

        expect(wrapper.exists()).toBeTruthy();

        wrapper.unmount();
    });

    it("can move to next page", async () => {
        const {store, wrapper} = mountGrid({bc: {...gridBc, filters: [filterBc]}});
        const spyOnSetPageNumberAction = jest.spyOn(store.recordsStore, "setPageNumberAction");

        await store.loadRecordsAction();

        wrapper
            .find(Pagination)
            .find({iconfont: "angle-right"})
            .first()
            .simulate("click");

        expect(wrapper.exists()).toBeTruthy();
        expect(spyOnSetPageNumberAction).toHaveBeenCalledWith(1);

        wrapper.unmount();
    });

    it("Check text structure for row", async () => {
        const {store, wrapper} = mountGrid({bc: {...gridBc, filters: [filterBc]}});

        await store.loadRecordsAction();

        wrapper.update();

        wrapper.find(GridRow).forEach((row) => {
            expect(row.text()).toMatchSnapshot();
        });

        wrapper.unmount();
    });

    it("Check text structure for header", async () => {
        const {store, wrapper} = mountGrid({bc: {...gridBc, filters: [filterBc]}});

        await store.loadRecordsAction();

        wrapper.update();

        wrapper
            .find(BaseGridTableHeader)
            .find(TableCell)
            .forEach((cell) => {
                expect(cell.text()).toMatchSnapshot();
            });

        wrapper.unmount();
    });

    it("Ckeck search action", async () => {
        const {store, wrapper} = mountGrid({bc: {...gridBc, filters: [filterBc]}});
        const spyOnLoadRecordsAction = jest.spyOn(store.recordsStore, "loadRecordsAction");

        // Submit search form
        wrapper
            .find(BuilderFilter)
            .find("form")
            .prop("onSubmit")(new Event("submit"));

        await sleep(0);

        expect(spyOnLoadRecordsAction).toHaveBeenCalledWith({selectedRecordId: undefined});

        wrapper.unmount();
    });

    it("Change sort of column", () => {
        const {store, wrapper} = mountGrid({bc: {...gridBc, filters: [filterBc]}});
        const spyOnLoadRecordsAction = jest.spyOn(store.recordsStore, "loadRecordsAction");

        expect(store.recordsStore.order).toEqual({direction: gridBc.orderdirection, property: gridBc.orderproperty});

        wrapper
            .find(TableSortLabel)
            .first()
            .simulate("click");

        expect(store.recordsStore.order).toEqual({direction: "DESC", property: "cv_name_displayed"});
        expect(spyOnLoadRecordsAction).toHaveBeenCalledWith();

        wrapper
            .find(TableSortLabel)
            .first()
            .simulate("click");
        expect(store.recordsStore.order).toEqual({direction: "ASC", property: "cv_name_displayed"});

        wrapper.unmount();
    });

    it("orderproperty is required for grid", () => {
        const {wrapper} = mountGrid({bc: {...gridBc, orderproperty: ""}});

        expect(wrapper.text()).toContain("Необходимо заполнить orderproperty для дальнейшей работы таблицы");

        wrapper.unmount();
    });

    it("change visible from false to true", () => {
        const {wrapper, pageStore} = mountGrid({bc: {...gridBc, orderproperty: ""}, visible: false});
        const spyOnUpdateGridWidth = jest.spyOn(wrapper.find(BuilderBaseGridBase).instance(), "handleUpdateGridWidth");

        wrapper.setProps({visible: true});

        wrapper.setProps({visible: undefined});

        pageStore.setVisibleAction(false);
        pageStore.setVisibleAction(true);

        expect(spyOnUpdateGridWidth).toHaveBeenCalledTimes(1);

        wrapper.unmount();
    });
});
