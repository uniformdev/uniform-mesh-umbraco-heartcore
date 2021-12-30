import React from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import { useUniformMeshLocation } from '@uniformdev/mesh-sdk-react';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { SettingsValue } from '../types/types';

export default function Settings() {
  const { value, setValue } = useUniformMeshLocation<SettingsValue>();

  const handleSettingsChange = async (settings: SettingsValue) => {
    await setValue(settings);
  };

  return (
    <>
      <h3>Settings page goes here yo.</h3>
      {value ? <SettingsInner settings={value} onSettingsChange={handleSettingsChange} /> : null}
    </>
  );
}

const SettingsInner = ({
  settings,
  onSettingsChange,
}: {
  settings: SettingsValue;
  onSettingsChange: (formValues: SettingsValue) => Promise<void>;
}) => {
  const handleSubmit = async (
    formValues: SettingsValue,
    helpers: FormikHelpers<SettingsValue & { generalError?: string }>
  ) => {
    try {
      await onSettingsChange(formValues);
    } catch (err) {
      helpers.setErrors({ generalError: err.message });
    }
  };

  return (
    <Formik<SettingsValue & { generalError?: string }>
      initialValues={settings || { meaning: '', other: '' }}
      onSubmit={handleSubmit}
    >
      {({ errors, isSubmitting }) => {
        return (
          <Form className="space-y-4 relative">
            <LoadingOverlay isActive={isSubmitting} />
            {errors.generalError ? <div>{errors.generalError}</div> : null}
            <div className="uniform-input-container">
              <label htmlFor="projectAlias" className="uniform-input-label">
                Project Alias
              </label>
              <Field name="projectAlias" className="uniform-input uniform-input-text" />
            </div>
            <div className="uniform-input-container">
              <label htmlFor="apiKey" className="uniform-input-label">
                API Key
              </label>
              <Field name="apiKey" className="uniform-input uniform-input-text" />
            </div>
            <input type="submit" value="Save" className="btn-secondary" disabled={isSubmitting} />
          </Form>
        );
      }}
    </Formik>
  );
};
