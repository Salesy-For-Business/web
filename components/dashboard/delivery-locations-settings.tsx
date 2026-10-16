"use client";

import { useMemo, useState } from "react";
import { Country, State } from "country-state-city";
import { MapPin, X } from "lucide-react";
import clsx from "clsx";
import {
  fieldErrorClass,
  primaryButtonClass,
} from "@/components/auth/styles";
import { SearchableSelect } from "@/components/searchable-select";
import { useAuthStore, type AuthDeliveryLocation } from "@/lib/auth-store";
import { useUpdateDeliveryLocationsMutation } from "@/lib/auth/queries";
import { getApiError } from "@/lib/api/client";

const COUNTRY_OPTIONS = Country.getAllCountries().map((c) => ({
  value: c.isoCode,
  label: c.name,
}));

export function DeliveryLocationsSettings() {
  const business = useAuthStore((s) => s.business);
  const mutation = useUpdateDeliveryLocationsMutation();

  const [locations, setLocations] = useState<AuthDeliveryLocation[]>(
    business?.deliveryLocations ?? [],
  );
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const stateOptions = useMemo(() => {
    if (!country) return [];
    return State.getStatesOfCountry(country).map((s) => ({
      value: s.isoCode,
      label: s.name,
    }));
  }, [country]);

  function addLocation() {
    setError(null);
    setSuccess(false);
    const countryMeta = COUNTRY_OPTIONS.find((c) => c.value === country);
    const stateMeta = stateOptions.find((s) => s.value === state);
    if (!countryMeta || !stateMeta) {
      setError("Select a country and state to add.");
      return;
    }
    const exists = locations.some(
      (l) => l.country === countryMeta.value && l.state === stateMeta.value,
    );
    if (exists) {
      setError("That location is already in your list.");
      return;
    }
    setLocations((prev) => [
      ...prev,
      {
        country: countryMeta.value,
        countryName: countryMeta.label,
        state: stateMeta.value,
        stateName: stateMeta.label,
      },
    ]);
    setCountry("");
    setState("");
  }

  function removeLocation(index: number) {
    setLocations((prev) => prev.filter((_, i) => i !== index));
    setSuccess(false);
  }

  async function onSave() {
    setError(null);
    setSuccess(false);
    try {
      await mutation.mutateAsync({ deliveryLocations: locations });
      setSuccess(true);
    } catch (err) {
      setError(getApiError(err, "Could not save delivery locations."));
    }
  }

  if (!business) return null;

  return (
    <section
      id="delivery-locations"
      className="rounded-xl border border-border bg-background p-6"
    >
      <h2 className="text-[18px] leading-7">Delivery locations</h2>
      <p className="mt-2 text-[14px] leading-5 text-muted">
        Add the countries and states you deliver to — buyers pick one of these
        at checkout instead of typing an address.
      </p>

      {locations.length === 0 ? (
        <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-tonal text-link">
            <MapPin className="size-5" aria-hidden />
          </div>
          <h3 className="mt-4 text-[16px] font-medium text-heading">
            No delivery locations yet
          </h3>
          <p className="mt-1 max-w-sm text-[13px] text-muted">
            Buyers can’t check out until you add at least one location below.
          </p>
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-2">
          {locations.map((loc, index) => (
            <li
              key={`${loc.country}-${loc.state}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
            >
              <span className="text-[14px] text-heading">
                {loc.stateName}, {loc.countryName}
              </span>
              <button
                type="button"
                onClick={() => removeLocation(index)}
                aria-label={`Remove ${loc.stateName}, ${loc.countryName}`}
                className="text-muted hover:text-heading"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <SearchableSelect
          id="new-location-country"
          placeholder="Select country"
          options={COUNTRY_OPTIONS}
          value={country}
          onChange={(value) => {
            setCountry(value);
            setState("");
          }}
        />
        <SearchableSelect
          id="new-location-state"
          placeholder={country ? "Select state" : "Select a country first"}
          options={stateOptions}
          value={state}
          onChange={setState}
          disabled={!country}
        />
        <button
          type="button"
          onClick={addLocation}
          disabled={!country || !state}
          className={clsx(
            "h-12 rounded-lg border border-border px-5 text-[14px] font-medium text-heading hover:bg-surface",
            "disabled:pointer-events-none disabled:opacity-60",
          )}
        >
          Add
        </button>
      </div>

      {error ? (
        <p className={fieldErrorClass} role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-1.5 text-[13px] text-green-700 dark:text-green-500" role="status">
          Delivery locations saved.
        </p>
      ) : null}

      <button
        type="button"
        onClick={onSave}
        disabled={mutation.isPending}
        className={clsx(primaryButtonClass, "mt-5 w-auto min-w-40 px-6")}
      >
        {mutation.isPending ? "Saving…" : "Save delivery locations"}
      </button>
    </section>
  );
}
