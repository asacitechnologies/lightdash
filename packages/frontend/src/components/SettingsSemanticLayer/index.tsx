import { assertUnreachable, SemanticLayerType } from '@lightdash/common';
import { Stack, Text, Title } from '@mantine/core';
import { useState, type FC } from 'react';
import { z } from 'zod';
import useToaster from '../../hooks/toaster/useToaster';
import {
    useProject,
    useProjectSemanticLayerUpdateMutation,
} from '../../hooks/useProject';
import { SettingsGridCard } from '../common/Settings/SettingsCard';
import DbtSemanticLayerForm, {
    dbtSemanticLayerFormSchema,
} from './DbtSemanticLayerForm';

interface Props {
    projectUuid: string;
}

// const SemanticLayerOptions = [
//     {
//         label: 'Cube',
//         value: SemanticLayerType.CUBE,
//     },
//     {
//         label: 'DBT',
//         value: SemanticLayerType.DBT,
//     },
// ];

const SemanticLayerLabels: Record<SemanticLayerType, string> = {
    [SemanticLayerType.CUBE]: 'Cube',
    [SemanticLayerType.DBT]: 'dbt',
};

const formSchemas = z.union([dbtSemanticLayerFormSchema, z.never()]);

const SettingsSemanticLayer: FC<Props> = ({ projectUuid }) => {
    const { data } = useProject(projectUuid);
    const { showToastSuccess } = useToaster();

    const [semanticLayerType] = useState<SemanticLayerType>(
        data?.semanticLayerConnection?.type ?? SemanticLayerType.DBT,
    );

    const projectMutation = useProjectSemanticLayerUpdateMutation(projectUuid);

    const handleSubmit = async (
        connectionData: z.infer<typeof formSchemas>,
    ) => {
        await projectMutation.mutateAsync(connectionData);

        showToastSuccess({
            title: `Successfully updated project's semantic layer connection with ${SemanticLayerLabels[semanticLayerType]} credentials.`,
        });

        return false;
    };

    return (
        <SettingsGridCard>
            <Stack spacing="sm">
                <Title order={4}>Semantic Layer</Title>

                <Text color="dimmed">
                    Connect your third-party Semantic Layer so you can explore
                    and report on your metric definitions in Lightdash.
                </Text>
            </Stack>

            <Stack>
                {/* <Select
                    label="Semantic Layer Type"
                    data={SemanticLayerOptions}
                    value={semanticLayerType}
                    onChange={(value: SemanticLayerType) =>
                        setSemanticLayerType(value)
                    }
                /> */}

                {semanticLayerType === SemanticLayerType.DBT ? (
                    <DbtSemanticLayerForm
                        isLoading={projectMutation.isLoading}
                        onSubmit={handleSubmit}
                        semanticLayerConnection={
                            semanticLayerType ===
                            data?.semanticLayerConnection?.type
                                ? data.semanticLayerConnection
                                : undefined
                        }
                    />
                ) : semanticLayerType === SemanticLayerType.CUBE ? (
                    <>not implemented</>
                ) : (
                    assertUnreachable(
                        semanticLayerType,
                        `Unknown semantic layer type: ${semanticLayerType}`,
                    )
                )}
            </Stack>
        </SettingsGridCard>
    );
};

export default SettingsSemanticLayer;