import { type PieChartSQLConfig } from '@lightdash/common';
import { Center, Skeleton } from '@mantine/core';
import EChartsReact, { type EChartsReactProps } from 'echarts-for-react';
import { memo, type FC } from 'react';
import { type ResultsAndColumns } from '../../hooks/useSqlQueryRun';
import { usePieChart } from '../../transformers/usePieChart';

type PieChartProps = {
    data: ResultsAndColumns;
    config: PieChartSQLConfig;
    isLoading: boolean;
} & Partial<Pick<EChartsReactProps, 'style'>>;

const PieChart: FC<PieChartProps> = memo(
    ({ data, config, style, isLoading: isLoadingProp }) => {
        const {
            loading: transformLoading,
            error,
            value: spec,
        } = usePieChart(data.results, data.columns, config);
        const loading = isLoadingProp || transformLoading;

        if (error) {
            return <Center>{error.message}</Center>;
        }

        return (
            <>
                {!spec && <Skeleton h="100%" />}
                {spec && (
                    <EChartsReact
                        option={spec}
                        showLoading={loading}
                        opts={{
                            renderer: 'svg',
                            width: 'auto',
                            height: 'auto',
                        }}
                        style={style}
                    />
                )}
            </>
        );
    },
);

export default PieChart;