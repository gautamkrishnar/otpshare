import {
  FormGroup,
  HelperText,
  HelperTextItem,
  TextArea,
  type TextAreaProps,
} from '@patternfly/react-core';
import { useField } from 'formik';

interface FormikTextAreaProps extends Omit<TextAreaProps, 'onChange' | 'onBlur' | 'value'> {
  name: string;
  label: string;
  isRequired?: boolean;
  helperText?: string;
}

export const FormikTextArea = ({
  name,
  label,
  isRequired = false,
  helperText,
  ...props
}: FormikTextAreaProps) => {
  const [field, meta] = useField(name);

  const hasError = meta.touched && meta.error;
  const validated = hasError ? ('error' as const) : ('default' as const);

  return (
    <FormGroup label={label} isRequired={isRequired} fieldId={name}>
      <TextArea id={name} {...field} {...props} validated={validated} />
      {(helperText || hasError) && (
        <HelperText>
          <HelperTextItem variant={hasError ? 'error' : 'default'}>
            {hasError ? meta.error : helperText}
          </HelperTextItem>
        </HelperText>
      )}
    </FormGroup>
  );
};
