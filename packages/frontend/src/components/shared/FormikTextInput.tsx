import { FormGroup, HelperText, HelperTextItem, TextInput, type TextInputProps } from '@patternfly/react-core';
import { useField } from 'formik';

interface FormikTextInputProps extends Omit<TextInputProps, 'onChange' | 'onBlur' | 'value'> {
  name: string;
  label: string;
  isRequired?: boolean;
  helperText?: string;
}

export const FormikTextInput = ({
  name,
  label,
  isRequired = false,
  helperText,
  ...props
}: FormikTextInputProps) => {
  const [field, meta] = useField(name);

  const hasError = meta.touched && meta.error;
  const validated = hasError ? ('error' as const) : ('default' as const);

  return (
    <FormGroup label={label} isRequired={isRequired} fieldId={name}>
      <TextInput
        id={name}
        {...field}
        {...props}
        validated={validated}
      />
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
