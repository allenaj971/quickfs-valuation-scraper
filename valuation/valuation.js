// this file will value companies based on cash flow statement
const cfs = require("../json/scraped_financials/cash_flow_statement.json");
const is = require("../json/scraped_financials/income_statement.json");
// import json export
var fs = require("fs");
// storing indices for the accounting metrics required from the json file
let ocf_index,
  ppe_index,
  dep_index,
  rev_index,
  ebit_index,
  shares_index,
  icf_index,
  netdebt_index,
  netint_index;
// Exact string to check indices in the json file these metrics
const ocf = /(\bCash From Operations\b)/;
const ppe = /(\bProperty, Plant, & Equipment\b)/;
const dep = /(\bDepreciation & Amortization\b)/;
const sales = /(\bRevenue\b)/;
const ebit = /(\bOperating Profit\b)/;
const shares = "Shares (Diluted)";
const icf = /(\bCash From Investing\b)/;
const net_debt = /(\bNet Issuance of Debt\b)/;
const net_interest = /(\bNet Interest Income\b)/;
// initialise cfs_metrics so that it can be exported
const cfs_metrics = [];
// growth rates to simulate various business growth rates
const grow_rates = ["0.05", "0.1", "0.15", "0.2", "0.3", "0.4", "0.5"];

// this for loop FCF Margin and Rule of 40
for (i = 0; i < cfs.length; i++) {
  // Initialise cfs_metrics company array
  cfs_metrics[i] = [];

  for (let j = 0; j < cfs[i].length; j++) {
    if (is[i][j][0]) {
      if (String(cfs[i][j][0]).match(ocf)) {
        // if element matches "Cash from Operations", set j to ocf_index
        ocf_index = j;
      } else if (String(cfs[i][j][0]).match(ppe)) {
        // if element matches "Property, Plant and Equipment", set j to ppe_index
        ppe_index = j;
      } else if (String(cfs[i][j][0]).match(dep)) {
        // if element matches "Depreciation and Amortization", set j to dep_index
        dep_index = j;
      } else if (String(cfs[i][j][0]).match(icf)) {
        // if element matches "Cash From Investing", set j to dep_index
        icf_index = j;
      } else if (String(cfs[i][j][0]).match(net_debt)) {
        // if element matches "Cash From Investing", set j to dep_index
        netdebt_index = j;
      }
    }
  }

  for (let j = 0; j < is[i].length; j++) {
    if (is[i][j][0]) {
      if (String(is[i][j][0]).match(sales)) {
        // if element matches "Revenue", set j to rev_index
        rev_index = j;
      } else if (String(is[i][j][0]).match(ebit)) {
        // if element matches "Operating Profit", set j to ebit_index
        ebit_index = j;
      } else if (String(is[i][j][0]).includes(shares)) {
        // if element includes "Shares (Diluted)", set j to shares_index
        shares_index = j;
      } else if (String(is[i][j][0]).match(net_interest)) {
        // if element includes "Shares (Diluted)", set j to shares_index
        netint_index = j;
      }
    }
  }

  // assign jth index company name
  cfs_metrics[i][0] = cfs[i][0];

  // Add Years and FCF Margin. we loop the length of the year no of times
  for (let k = 0; k < cfs[i][1].length; k++) {
    // assign new row for years
    cfs_metrics[i][1] = [];
    // Add FCF margin years heading
    cfs_metrics[i][1][0] = "Year - FCF margin";

    for (l = 1; l < cfs[i][1].length - 1; l++) {
      cfs_metrics[i][1][l] = cfs[i][1][l];
    }

    // assign new row for FCF margin
    cfs_metrics[i][2] = [];
    // Add FCF margin
    cfs_metrics[i][2][0] = "FCF Margin";

    // we iterate and assign to cfs_metrics.json valid FCF % sales values
    for (let l = 1; l < cfs[i][1].length - 1; l++) {
      // Add FCF Margin = OCF_current_period / Sales_current_period
      // site: https://blog.apruve.com/profitability-metrics-free-cash-flow-margin
      if (
        String(
          parseFloat(cfs[i][ocf_index][l].replace(/[^\d\.\-]/g, "")) /
            parseFloat(is[i][rev_index][l].replace(/[^\d\.\-]/g, ""))
        ) === "NaN"
      ) {
        cfs_metrics[i][2][l] = "0";
      } else {
        cfs_metrics[i][2][l] = (
          parseFloat(cfs[i][ocf_index][l].replace(/[^\d\.\-]/g, "")) /
          parseFloat(is[i][rev_index][l].replace(/[^\d\.\-]/g, ""))
        ).toFixed(2);
      }
    }
    // initialise the rule of 40 values row
    cfs_metrics[i][3] = [];
    cfs_metrics[i][3][0] =
      "Rule of 40 (SaaS metric - value must be greater than 40% or 0.4)";
    // ((EBIT + D&A)/ Sales) + growth rates (provide multiple rates to show whether business is undervalued or overvalued based on different rates)
    // growth rate used is the YoY OCF growth rate: https://www.thesaascfo.com/rule-of-40-saas/
    cfs_metrics[i][3][1] = (
      (parseFloat(
        is[i][ebit_index][is[i][ebit_index].length - 1].replace(
          /[^\d\.\-]/g,
          ""
        )
      ) +
        parseFloat(
          cfs[i][dep_index][cfs[i][dep_index].length - 1].replace(
            /[^\d\.\-]/g,
            ""
          )
        )) /
        parseFloat(
          is[i][rev_index][is[i][rev_index].length - 1].replace(
            /[^\d\.\-]/g,
            ""
          )
        ) +
      parseFloat(
        cfs[i][ocf_index][cfs[i][ocf_index].length - 1].replace(
          /[^\d\.\-]/g,
          ""
        )
      ) /
        parseFloat(
          cfs[i][ocf_index][cfs[i][ocf_index].length - 2].replace(
            /[^\d\.\-]/g,
            ""
          )
        )
    ).toFixed(2);
  }

  // Below are the TTM
  // FCF-based EV valuation. FCF * multiple / no of shares = EV
  // Then divide EV by shares (diluted) to get value/share
  let evfcf_ratio = 20;
  cfs_metrics[i][4] = [];
  cfs_metrics[i][5] = [];
  cfs_metrics[i][5][0] = `Share Value based on multiple of TTM FCF`;
  cfs_metrics[i][4][0] = `Multiple:`;

  for (let j = 1; j < 6; j++) {
    cfs_metrics[i][4][j] = `${evfcf_ratio}x`;
    cfs_metrics[i][5][j] = (
      ((parseFloat(
        cfs[i][ocf_index][cfs[i][ocf_index].length - 1].replace(
          /[^\d\.\-]/g,
          ""
        )
      ) +
        parseFloat(
          cfs[i][ppe_index][cfs[i][ppe_index].length - 1].replace(
            /[^\d\.\-]/g,
            ""
          )
        )) *
        parseFloat(evfcf_ratio)) /
      parseFloat(
        is[i][shares_index][is[i][shares_index].length - 1].replace(
          /[^\d\.\-]/g,
          ""
        )
      )
    ).toFixed(2);
    evfcf_ratio += 10;
  }

  // EBIT-based EV valuation. EBIT * multiple / no of shares = EV
  let evebit_ratio = 20;
  cfs_metrics[i][6] = [];
  cfs_metrics[i][6][0] = "Share Value based on multiple of TTM EBIT";
  for (let j = 1; j < 6; j++) {
    cfs_metrics[i][6][j] = (
      (parseFloat(
        is[i][ebit_index][is[i][ebit_index].length - 1].replace(
          /[^\d\.\-]/g,
          ""
        )
      ) *
        evebit_ratio) /
      parseFloat(
        is[i][shares_index][is[i][shares_index].length - 1].replace(
          /[^\d\.\-]/g,
          ""
        )
      )
    ).toFixed(2);
    evebit_ratio += 10;
  }

  // EBITDA-based EV valuation. EBITDA * multiple / no of shares = EV
  let evebitda_ratio = 20;
  cfs_metrics[i][7] = [];
  cfs_metrics[i][7][0] = "Share Value based on multiple of TTM EBITDA ";
  for (let j = 1; j < 6; j++) {
    cfs_metrics[i][7][j] = (
      ((parseFloat(
        is[i][ebit_index][is[i][ebit_index].length - 1].replace(
          /[^\d\.\-]/g,
          ""
        )
      ) +
        parseFloat(
          cfs[i][dep_index][cfs[i][dep_index].length - 1].replace(
            /[^\d\.\-]/g,
            ""
          )
        )) *
        evebitda_ratio) /
      parseFloat(
        is[i][shares_index][is[i][shares_index].length - 1].replace(
          /[^\d\.\-]/g,
          ""
        )
      )
    ).toFixed(2);
    evebitda_ratio += 10;
  }

  // Sales-based EV valuation. Sales * multiple / no of shares = EV
  let sales_ratio = 20;
  cfs_metrics[i][8] = [];
  cfs_metrics[i][8][0] = "Share Value based on multiple of TTM Sales ";
  for (let j = 1; j < 6; j++) {
    cfs_metrics[i][8][j] = (
      (parseFloat(
        is[i][rev_index][is[i][rev_index].length - 1].replace(/[^\d\.\-]/g, "")
      ) *
        sales_ratio) /
      parseFloat(
        is[i][shares_index][is[i][shares_index].length - 1].replace(
          /[^\d\.\-]/g,
          ""
        )
      )
    ).toFixed(2);
    sales_ratio += 10;
  }

  // Forward looking analysis
  // Discounted FCFE 5 years into the future based on growth rates, discount factor of 20% and EV/FCFE = 10
  cfs_metrics[i][9] = [];
  cfs_metrics[i][9][0] = "Growth Rates";
  let dis_factor = 0.2;
  let evfcf = 20;

  cfs_metrics[i][10] = [];
  cfs_metrics[i][10][0] = `DFCFE analysis (Discount of ${
    dis_factor * 100
  }%, EV/FCFE = ${evfcf}, 5 Years)`;
  for (let j = 1; j < grow_rates.length; j++) {
    var sum = 0;
    cfs_metrics[i][9][j] = grow_rates[j];

    for (let k = 1; k < 6; k++) {
      if (cfs[i][netdebt_index]) {
        sum += parseFloat(
          (
            ((parseFloat(
              cfs[i][ocf_index][cfs[i][ocf_index].length - 1].replace(
                /[^\d\.\-]/g,
                ""
              )
            ) +
              parseFloat(
                cfs[i][icf_index][cfs[i][icf_index].length - 1].replace(
                  /[^\d\.\-]/g,
                  ""
                )
              ) +
              parseFloat(
                cfs[i][netdebt_index][cfs[i][netdebt_index].length - 1].replace(
                  /[^\d\.\-]/g,
                  ""
                )
              )) *
              (1 + parseFloat(grow_rates[j - 1])) ** k) /
            (1 + dis_factor) ** k
          ).toFixed(2)
        );
      }
      if (!cfs[i][netdebt_index]) {
        sum += parseFloat(
          (
            ((parseFloat(
              cfs[i][ocf_index][cfs[i][ocf_index].length - 1].replace(
                /[^\d\.\-]/g,
                ""
              )
            ) +
              parseFloat(
                cfs[i][icf_index][cfs[i][icf_index].length - 1].replace(
                  /[^\d\.\-]/g,
                  ""
                )
              )) *
              (1 + parseFloat(grow_rates[j - 1])) ** k) /
            (1 + dis_factor) ** k
          ).toFixed(2)
        );
      }

      cfs_metrics[i][10][j] = (
        (sum * evfcf) /
        parseFloat(
          is[i][shares_index][is[i][shares_index].length - 1].replace(
            /[^\d\.\-]/g,
            ""
          )
        )
      ).toFixed(2);
    }
  }

  // Discounted FCFF 5 years into the future based on growth rates, discount factor of 20%, tax of 20%, and EV/FCFE = 10
  let tax = 0.2;

  cfs_metrics[i][11] = [];
  cfs_metrics[i][11][0] = `DFCFF analysis (Discount of ${
    dis_factor * 100
  }%, EV/FCFF = ${evfcf}, Tax = ${tax * 100}%, 5 Years)`;
  for (let j = 1; j < grow_rates.length; j++) {
    var sum = 0;
    for (let k = 1; k < 6; k++) {
      sum += parseFloat(
        (
          ((parseFloat(
            cfs[i][ocf_index][cfs[i][ocf_index].length - 1].replace(
              /[^\d\.\-]/g,
              ""
            )
          ) +
            parseFloat(
              cfs[i][icf_index][cfs[i][icf_index].length - 1].replace(
                /[^\d\.\-]/g,
                ""
              )
            ) +
            parseFloat(
              is[i][netint_index][is[i][netint_index].length - 1].replace(
                /[^\d\.\-]/g,
                ""
              )
            ) *
              (1 - tax)) *
            (1 + parseFloat(grow_rates[j - 1])) ** k) /
          (1 + dis_factor) ** k
        ).toFixed(2)
      );

      cfs_metrics[i][11][j] = (
        (sum * evfcf) /
        parseFloat(
          is[i][shares_index][is[i][shares_index].length - 1].replace(
            /[^\d\.\-]/g,
            ""
          )
        )
      ).toFixed(2);
    }
  }
}

// write to JSON file: https://www.semicolonworld.com/question/47954/node-js-how-to-write-an-array-to-file
fs.writeFile(
  "../json/valuation/valuation.json",
  JSON.stringify(cfs_metrics),
  function (err) {
    if (err) {
      console.error(err);
    }
  }
);

// Periods year
// if (cfs[i][1].length > 4) {
//   // we iterate and assign to cfs_metrics.json the valid years
//   for (let l = 2; l < cfs[i][1].length - 2; l++) {
//     // // Add periods
//     // cfs_metrics[i][1][l - 1] = cfs[i][1][l - 1] + "-" + cfs[i][1][l];
//     // cfs_metrics[i][1][l] = cfs[i][1][l] + "-" + cfs[i][1][l + 1];
//   }
// } else if (cfs[i][1].length <= 4) {
//   // cfs_metrics[i][1][1] = cfs[i][1][1] + "-" + cfs[i][1][2];
// }
