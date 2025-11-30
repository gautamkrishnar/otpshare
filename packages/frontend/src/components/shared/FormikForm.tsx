import { Form as PFForm } from '@patternfly/react-core';
import {
  Formik,
  type FormikConfig,
  type FormikProps,
  type FormikValues,
  useFormikContext,
} from 'formik';
import type { ReactNode, Ref } from 'react';

interface FormikFormProps<Values extends FormikValues> extends FormikConfig<Values> {
  children: ReactNode | ((formik: FormikProps<Values>) => ReactNode);
  innerRef?: Ref<FormikProps<Values>>;
}

function FormContent<Values extends FormikValues>({
  children,
}: {
  children: ReactNode | ((formik: FormikProps<Values>) => ReactNode);
}) {
  const formik = useFormikContext<Values>();

  return (
    <PFForm onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
      {typeof children === 'function' ? children(formik) : children}
    </PFForm>
  );
}

export function FormikForm<Values extends FormikValues>({
  children,
  innerRef,
  ...formikProps
}: FormikFormProps<Values>) {
  return (
    <Formik innerRef={innerRef} {...formikProps}>
      <FormContent<Values>>{children}</FormContent>
    </Formik>
  );
}
