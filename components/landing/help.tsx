"use client";

import { useState } from "react";
import clsx from "clsx";
import { landingOptions, type LandingOptionId } from "./options";

function scrollToSection(id: LandingOptionId) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Help() {
  const [selected, setSelected] = useState<LandingOptionId>("business");
  const active =
    landingOptions.find((option) => option.id === selected) ?? landingOptions[0];

  function select(id: LandingOptionId) {
    setSelected(id);
    scrollToSection(id);
  }

  return (
    <section className="flex flex-col items-center px-6 py-24 text-center sm:px-10">
      <h2 className="max-w-3xl text-5xl leading-14 tracking-[-0.5px] sm:text-[56px] sm:leading-16">
        What can we help you with?
      </h2>

      <div
        role="tablist"
        aria-label="What we can help you with"
        className="mt-10 flex flex-wrap items-center justify-center gap-3"
      >
        {landingOptions.map((option) => {
          const isSelected = option.id === selected;
          const badge = "badge" in option ? option.badge : undefined;

          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              id={`help-tab-${option.id}`}
              aria-controls="help-panel"
              onClick={() => select(option.id)}
              className={clsx(
                "inline-flex h-12 items-center rounded-full border px-6 text-[15px] font-medium transition-colors",
                isSelected
                  ? "border-transparent bg-tonal text-link"
                  : "border-blue-200 text-link hover:bg-tonal hover:text-link",
              )}
            >
              {option.label}
              {badge ? (
                <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium leading-none text-green-700">
                  {badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        id="help-panel"
        role="tabpanel"
        aria-labelledby={`help-tab-${active.id}`}
        className="mt-8 flex flex-col items-center"
      >
        <p className="max-w-xl text-base leading-7 text-foreground">
          {active.description}
        </p>
        <button
          type="button"
          onClick={() => scrollToSection(active.id)}
          className="mt-8 inline-flex h-12 items-center rounded-lg border border-primary bg-primary px-6 text-[15px] font-medium text-white hover:bg-primary-hover"
        >
          {active.cta}
        </button>
      </div>
    </section>
  );
}
