import { useCallback, useEffect, useMemo, useState, type FC } from 'react';

import {
    getEmailSchema,
    isOpenIdIdentityIssuerType,
    LightdashMode,
    LocalIssuerTypes,
    SEED_ORG_1_ADMIN_EMAIL,
    SEED_ORG_1_ADMIN_PASSWORD,
} from '@lightdash/common';

import { Card, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { Redirect, useLocation } from 'react-router-dom';
import { z } from 'zod';
import PageSpinner from '../../../components/PageSpinner';
import useToaster from '../../../hooks/toaster/useToaster';
import { useFlashMessages } from '../../../hooks/useFlashMessages';
import { useApp } from '../../../providers/AppProvider';
import { useTracking } from '../../../providers/TrackingProvider';
import {
    useFetchLoginOptions,
    useLoginWithEmailMutation,
    type LoginParams,
} from '../hooks/useLogin';

const Login: FC<{}> = () => {
    const { health } = useApp();
    const { identify } = useTracking();
    const location = useLocation<{ from?: Location } | undefined>();

    const { showToastError, showToastApiError } = useToaster();
    const flashMessages = useFlashMessages();
    useEffect(() => {
        if (flashMessages.data?.error) {
            showToastError({
                title: 'Failed to authenticate',
                subtitle: flashMessages.data.error.join('\n'),
            });
        }
    }, [flashMessages.data, showToastError]);

    const [preCheckEmail, setPreCheckEmail] = useState<string>();

    const redirectUrl = location.state?.from
        ? `${location.state.from.pathname}${location.state.from.search}`
        : '/';

    const form = useForm<LoginParams>({
        initialValues: {
            email: '',
            password: '',
        },
        validate: zodResolver(
            z.object({
                email: getEmailSchema(),
            }),
        ),
    });

    const {
        data: loginOptions,
        isInitialLoading: isInitialLoadingLoginOptions,
        isLoading: loginOptionsLoading,
        isSuccess: loginOptionsSuccess,
    } = useFetchLoginOptions({
        email: preCheckEmail,
    });

    // Disable fetch once it has succeeded
    useEffect(() => {
        if (loginOptions && loginOptionsSuccess) {
            if (loginOptions.forceRedirect && loginOptions.redirectUri) {
                window.location.href = loginOptions.redirectUri;
            }
        }
    }, [loginOptionsSuccess, loginOptions]);

    const { mutate, isLoading, isSuccess, isIdle } = useLoginWithEmailMutation({
        onSuccess: (data) => {
            identify({ id: data.userUuid });
            window.location.href = redirectUrl;
        },
        onError: ({ error }) => {
            showToastApiError({
                title: `Failed to login`,
                apiError: error,
            });
        },
    });

    // Skip login for demo app
    const isDemo = health.data?.mode === LightdashMode.DEMO;
    useEffect(() => {
        if (isDemo && isIdle) {
            mutate({
                email: SEED_ORG_1_ADMIN_EMAIL.email,
                password: SEED_ORG_1_ADMIN_PASSWORD.password,
            });
        }
    }, [isDemo, mutate, isIdle]);

    const formStage = preCheckEmail ? 'login' : 'precheck';

    const isEmailLoginAvailable =
        loginOptions?.showOptions &&
        loginOptions?.showOptions.includes(LocalIssuerTypes.EMAIL);

    const handleFormSubmit = useCallback(() => {
        if (formStage === 'precheck' && form.values.email !== '') {
            setPreCheckEmail(form.values.email);
        } else if (
            formStage === 'login' &&
            isEmailLoginAvailable &&
            form.values.email !== '' &&
            form.values.password !== ''
        ) {
            mutate(form.values);
        }
    }, [form.values, formStage, isEmailLoginAvailable, mutate]);

    const disableControls =
        loginOptionsLoading ||
        (loginOptionsSuccess && loginOptions.forceRedirect === true) ||
        isLoading ||
        isSuccess;

    const ssoOptions = useMemo(() => {
        if (!loginOptions) {
            return [];
        }
        return loginOptions.showOptions.filter(isOpenIdIdentityIssuerType);
    }, [loginOptions]);

    if (health.isInitialLoading || isDemo || isInitialLoadingLoginOptions) {
        return <PageSpinner />;
    }
    if (health.status === 'success' && health.data?.requiresOrgRegistration) {
        return (
            <Redirect
                to={{
                    pathname: '/register',
                    state: { from: location.state?.from },
                }}
            />
        );
    }
    if (health.status === 'success' && health.data?.isAuthenticated) {
        return <Redirect to={redirectUrl} />;
    }

    // -----------------------------------------------------
    const { t, i18n } = useTranslation();

    const changeLanguage = (language: string) => {
        i18n.changeLanguage(language);
    };
    // -----------------------------------------------------
    return (
        <>
            <Card p="xl" radius="xs" withBorder shadow="xs">
                <Title order={3} ta="center" mb="md">
                    Sign in AZERTY
                </Title>

                <div>
                    <h1>{t('welcome')}</h1>
                    <p>{t('description')}</p>

                    {/* Boutons pour changer de langue */}
                    <button onClick={() => changeLanguage('fr')}>
                        Français
                    </button>
                    <button onClick={() => changeLanguage('en')}>
                        English
                    </button>
                </div>
            </Card>
        </>
    );
};

export default Login;
