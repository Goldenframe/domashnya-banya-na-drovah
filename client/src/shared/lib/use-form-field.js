import { useCallback } from "react";
import { useController } from "react-hook-form";

export function useFormField({ control, getValues, setValue }, name) {
  const { field } = useController({ control, name });
  const update = useCallback((value) => {
    setValue(name, typeof value === "function" ? value(getValues(name)) : value, {
      shouldDirty: true,
    });
  }, [getValues, name, setValue]);

  return [field.value, update];
}
