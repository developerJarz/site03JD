"use client";

import { useMemo } from "react";
import { CA_MARKET, US_MARKET, caCityMarket } from "@/content/country-sites/us/market";
import { setMoney } from "@/content/country-sites/us/money";
import { CalculatorSection, useUsCalc } from "./calculator";
import Growth360 from "./growth-360";
import PlanSection from "./plan-section";

/**
 * The interactive part of a country page: Google Ads calculator, growth-plan comparison
 * and 360° growth dashboard, sharing one state. Only the market id and city are passed
 * in, so the long-form copy never ships to the browser. Renders inside <CountryShell> (styles: country.css).
 */
export function CountryCalculator({
  market: marketId,
  city,
  defaultCat,
  title,
  lead,
}: {
  market: "us" | "ca";
  city?: { id: string; name: string };
  defaultCat: string;
  title: string;
  lead: string;
}) {
  const cityId = city?.id;
  const cityName = city?.name;
  // Canadian city pages adjust click and lead costs for local competition.
  const market = useMemo(
    () => (marketId === "ca" ? (cityId && cityName ? caCityMarket(cityId, cityName) : CA_MARKET) : US_MARKET),
    [marketId, cityId, cityName],
  );
  setMoney(market.symbol, market.locale);
  const calc = useUsCalc(defaultCat, `jd-site-calc-${cityId ?? marketId}`, market);

  return (
    <>
      <section id="calculator" className="anchor">
        <CalculatorSection calc={calc} title={title} lead={lead} />
      </section>
      <PlanSection calc={calc} place={cityName} />
      <Growth360 inp={calc.inp} catName={calc.cat.name} avg={market.avg} place={cityName} />
    </>
  );
}
