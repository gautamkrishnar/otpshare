import {
  FormGroup,
  FormSelect,
  FormSelectOption,
  type FormSelectProps,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { useField } from 'formik';

interface Option {
  value: string;
  label: string;
}

interface FormikSelectProps extends Omit<FormSelectProps, 'onChange' | 'onBlur' | 'value' | 'ref'> {
  name: string;
  label: string;
  isRequired?: boolean;
  helperText?: string;
  options: Option[];
}

export const FormikSelect = ({
  name,
  label,
  isRequired = false,
  helperText,
  options,
  ...props
}: FormikSelectProps) => {
  const [field, meta] = useField(name);

  const hasError = meta.touched && meta.error;
  const validated = hasError ? ('error' as const) : ('default' as const);

  return (
    <FormGroup label={label} isRequired={isRequired} fieldId={name}>
      <FormSelect
        id={name}
        name={field.name}
        value={field.value}
        onChange={(_, value) => field.onChange({ target: { name: field.name, value } })}
        onBlur={field.onBlur}
        {...props}
        validated={validated}
      >
        {options.map((option) => (
          <FormSelectOption key={option.value} value={option.value} label={option.label} />
        ))}
      </FormSelect>
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
