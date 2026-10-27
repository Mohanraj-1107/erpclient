import { useState, type FormEvent } from 'react';
import { MapPin, Plus, Save, Trash2, User } from 'lucide-react';
import type {
  CreateCustomerRequest,
  Customer,
  CustomerAddress,
} from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/ui/spinner';
import { FormSection } from '@/components/forms/FormSection';

interface CustomerFormProps {
  initial?: Customer;
  submitting?: boolean;
  submitLabel: string;
  serverError?: string;
  onSubmit: (payload: CreateCustomerRequest) => void;
  onCancel: () => void;
}

interface AddressFormState {
  street: string;
  city: string;
  district: string;
  pincode: string;
  state: string;
  country: string;
}

interface FormState {
  customerName: string;
  customerEmail: string;
  mobileNo: string;
  gstNo: string;
  addresses: AddressFormState[];
}

type FormErrors = Record<string, string>;

const EMPTY_ADDRESS: AddressFormState = {
  street: '',
  city: '',
  district: '',
  pincode: '',
  state: '',
  country: 'India',
};

function toAddressFormState(address: CustomerAddress): AddressFormState {
  return {
    street: address.street ?? '',
    city: address.city ?? '',
    district: address.district ?? '',
    pincode: address.pincode ?? '',
    state: address.state ?? '',
    country: address.country ?? '',
  };
}

function toFormState(customer?: Customer): FormState {
  return {
    customerName: customer?.customerName ?? '',
    customerEmail: customer?.customerEmail ?? '',
    mobileNo: customer?.mobileNo ?? '',
    gstNo: customer?.gstNo ?? '',
    addresses:
      customer?.address && customer.address.length > 0
        ? customer.address.map(toAddressFormState)
        : [{ ...EMPTY_ADDRESS }],
  };
}

function validate(state: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!state.customerName.trim()) {
    errors.customerName = 'Customer name is required';
  } else if (state.customerName.trim().length > 100) {
    errors.customerName = 'Customer name must be at most 100 characters';
  }

  if (!state.customerEmail.trim()) {
    errors.customerEmail = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.customerEmail.trim())) {
    errors.customerEmail = 'Enter a valid email address';
  }

  const mobileDigits = state.mobileNo.replace(/\D/g, '');
  if (!state.mobileNo.trim()) {
    errors.mobileNo = 'Mobile number is required';
  } else if (mobileDigits.length < 10 || mobileDigits.length > 15) {
    errors.mobileNo = 'Mobile number must be between 10 and 15 digits';
  }

  if (!state.gstNo.trim()) {
    errors.gstNo = 'GST number is required';
  }

  state.addresses.forEach((address, index) => {
    const prefix = `addresses.${index}`;

    if (!address.street.trim()) {
      errors[`${prefix}.street`] = 'Street is required';
    }
    if (!address.city.trim()) {
      errors[`${prefix}.city`] = 'City is required';
    }
    if (!address.district.trim()) {
      errors[`${prefix}.district`] = 'District is required';
    }
    if (!address.pincode.trim()) {
      errors[`${prefix}.pincode`] = 'Pincode is required';
    }
    if (!address.country.trim()) {
      errors[`${prefix}.country`] = 'Country is required';
    }
  });

  return errors;
}

export function CustomerForm({
  initial,
  submitting,
  submitLabel,
  serverError,
  onSubmit,
  onCancel,
}: CustomerFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [errors, setErrors] = useState<FormErrors>({});

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  };

  const setAddressField = (
    index: number,
    field: keyof AddressFormState,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      addresses: prev.addresses.map((address, addressIndex) =>
        addressIndex === index ? { ...address, [field]: value } : address
      ),
    }));

    setErrors((prev) => {
      const key = `addresses.${index}.${field}`;
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const addAddress = () => {
    setForm((prev) => ({
      ...prev,
      addresses: [...prev.addresses, { ...EMPTY_ADDRESS }],
    }));
  };

  const removeAddress = (index: number) => {
    setForm((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((_, addressIndex) => addressIndex !== index),
    }));

    setErrors((prev) => {
      const next: FormErrors = {};
      Object.entries(prev).forEach(([key, value]) => {
        if (!key.startsWith('addresses.')) next[key] = value;
      });
      return next;
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      customerName: form.customerName.trim(),
      customerEmail: form.customerEmail.trim(),
      mobileNo: form.mobileNo.replace(/\D/g, ''),
      gstNo: form.gstNo.trim().toUpperCase(),
      address: form.addresses.map((address) => ({
        street: address.street.trim(),
        city: address.city.trim(),
        district: address.district.trim(),
        pincode: address.pincode.trim(),
        state: address.state.trim(),
        country: address.country.trim(),
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {serverError && <Alert tone="error">{serverError}</Alert>}

      <FormSection
        icon={<User className="h-4 w-4" />}
        title="Customer information"
        description="Contact details used on sales orders and invoices."
        iconClassName="bg-indigo-100 text-indigo-600 ring-indigo-200"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Customer Name"
            htmlFor="customerName"
            required
            error={errors.customerName}
            hint={`${form.customerName.length}/100 characters`}
          >
            <Input
              id="customerName"
              value={form.customerName}
              onChange={(event) => setField('customerName', event.target.value)}
              placeholder="e.g. Acme Traders"
              maxLength={100}
              autoComplete="off"
              autoFocus
              disabled={submitting}
              aria-invalid={Boolean(errors.customerName)}
            />
          </FormField>

          <FormField
            label="Email"
            htmlFor="customerEmail"
            required
            error={errors.customerEmail}
            hint="Must be unique in your organization"
          >
            <Input
              id="customerEmail"
              type="email"
              value={form.customerEmail}
              onChange={(event) => setField('customerEmail', event.target.value)}
              placeholder="e.g. accounts@acme.com"
              autoComplete="email"
              disabled={submitting}
              aria-invalid={Boolean(errors.customerEmail)}
            />
          </FormField>

          <FormField
            label="Mobile Number"
            htmlFor="mobileNo"
            required
            error={errors.mobileNo}
            hint="10–15 digits; spaces, dashes, and + are ignored"
          >
            <Input
              id="mobileNo"
              type="tel"
              inputMode="tel"
              value={form.mobileNo}
              onChange={(event) => setField('mobileNo', event.target.value)}
              placeholder="e.g. 98765 43210"
              autoComplete="tel"
              maxLength={20}
              disabled={submitting}
              aria-invalid={Boolean(errors.mobileNo)}
            />
          </FormField>

          <FormField
            label="GST Number"
            htmlFor="gstNo"
            required
            error={errors.gstNo}
            hint="Business GSTIN"
          >
            <Input
              id="gstNo"
              value={form.gstNo}
              onChange={(event) => setField('gstNo', event.target.value)}
              placeholder="e.g. 22AAAAA0000A1Z5"
              autoComplete="off"
              maxLength={20}
              disabled={submitting}
              aria-invalid={Boolean(errors.gstNo)}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        icon={<MapPin className="h-4 w-4" />}
        title="Addresses"
        description="Add one or more billing or shipping addresses for this customer."
        iconClassName="bg-emerald-50 text-emerald-600 ring-emerald-100"
      >
        <div className="space-y-3">
          {form.addresses.map((address, index) => (
            <div
              key={index}
              className="rounded-lg border border-indigo-100/80 border-l-4 border-l-indigo-300 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/70 p-3.5"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-indigo-600 ring-1 ring-indigo-200">
                    <MapPin className="h-3.5 w-3.5" />
                  </span>
                  Address {index + 1}
                </div>

                {form.addresses.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAddress(index)}
                    disabled={submitting}
                    className="gap-1 px-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  label="Street"
                  htmlFor={`address-${index}-street`}
                  required
                  error={errors[`addresses.${index}.street`]}
                  className="sm:col-span-2"
                >
                  <Input
                    id={`address-${index}-street`}
                    value={address.street}
                    onChange={(event) =>
                      setAddressField(index, 'street', event.target.value)
                    }
                    placeholder="Building, street, area"
                    maxLength={200}
                    autoComplete="street-address"
                    disabled={submitting}
                    aria-invalid={Boolean(errors[`addresses.${index}.street`])}
                  />
                </FormField>

                <FormField
                  label="City"
                  htmlFor={`address-${index}-city`}
                  required
                  error={errors[`addresses.${index}.city`]}
                >
                  <Input
                    id={`address-${index}-city`}
                    value={address.city}
                    onChange={(event) =>
                      setAddressField(index, 'city', event.target.value)
                    }
                    placeholder="e.g. Mumbai"
                    maxLength={100}
                    autoComplete="address-level2"
                    disabled={submitting}
                    aria-invalid={Boolean(errors[`addresses.${index}.city`])}
                  />
                </FormField>

                <FormField
                  label="District"
                  htmlFor={`address-${index}-district`}
                  required
                  error={errors[`addresses.${index}.district`]}
                >
                  <Input
                    id={`address-${index}-district`}
                    value={address.district}
                    onChange={(event) =>
                      setAddressField(index, 'district', event.target.value)
                    }
                    placeholder="e.g. Mumbai Suburban"
                    maxLength={100}
                    autoComplete="address-level1"
                    disabled={submitting}
                    aria-invalid={Boolean(errors[`addresses.${index}.district`])}
                  />
                </FormField>

                <FormField
                  label="State"
                  htmlFor={`address-${index}-state`}
                  error={errors[`addresses.${index}.state`]}
                  hint="Optional"
                >
                  <Input
                    id={`address-${index}-state`}
                    value={address.state}
                    onChange={(event) =>
                      setAddressField(index, 'state', event.target.value)
                    }
                    placeholder="e.g. Maharashtra"
                    maxLength={100}
                    autoComplete="address-level1"
                    disabled={submitting}
                    aria-invalid={Boolean(errors[`addresses.${index}.state`])}
                  />
                </FormField>

                <FormField
                  label="Pincode"
                  htmlFor={`address-${index}-pincode`}
                  required
                  error={errors[`addresses.${index}.pincode`]}
                >
                  <Input
                    id={`address-${index}-pincode`}
                    value={address.pincode}
                    onChange={(event) =>
                      setAddressField(index, 'pincode', event.target.value)
                    }
                    placeholder="e.g. 400001"
                    maxLength={10}
                    autoComplete="postal-code"
                    disabled={submitting}
                    aria-invalid={Boolean(errors[`addresses.${index}.pincode`])}
                  />
                </FormField>

                <FormField
                  label="Country"
                  htmlFor={`address-${index}-country`}
                  required
                  error={errors[`addresses.${index}.country`]}
                  className="sm:col-span-2"
                >
                  <Input
                    id={`address-${index}-country`}
                    value={address.country}
                    onChange={(event) =>
                      setAddressField(index, 'country', event.target.value)
                    }
                    placeholder="e.g. India"
                    maxLength={100}
                    autoComplete="country-name"
                    disabled={submitting}
                    aria-invalid={Boolean(errors[`addresses.${index}.country`])}
                  />
                </FormField>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAddress}
            disabled={submitting}
            className="gap-1.5 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add another address
          </Button>
        </div>
      </FormSection>

      <div className="flex flex-col-reverse items-stretch gap-2 rounded-xl border border-slate-200/80 bg-gradient-to-r from-slate-100/90 via-white to-indigo-50/70 p-4 shadow-xs backdrop-blur-sm sm:flex-row sm:items-center sm:justify-end">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="gap-2">
          {submitting ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
