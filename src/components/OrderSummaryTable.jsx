import React from 'react';
import { FaMoneyBillWave } from 'react-icons/fa';
import { FiCornerDownRight } from 'react-icons/fi';

const OrderSummaryTable = ({
  suits,
  alterations,
  rawSubtotal
}) => {
  return (
    <div className="bg-white p-3.5 sm:p-5 rounded border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-2.5 sm:mb-3">
        <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
          <span className="w-5 h-5 rounded bg-amber-100 text-[#DFAC43] flex items-center justify-center text-xs">
            <FaMoneyBillWave />
          </span>
          3. Order Summary
        </h3>
        <span className="text-[10px] sm:text-[11px] font-black text-[#0F172A] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          Subtotal: Rs {rawSubtotal.toLocaleString()}
        </span>
      </div>

      <div className="border border-gray-200 rounded overflow-hidden bg-gray-50/40">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[300px]">
            <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px] border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-2.5 sm:px-3">Item / Service Details</th>
                <th className="py-2.5 px-2 text-center w-12 sm:w-16">Qty</th>
                <th className="py-2.5 px-2.5 sm:px-3 text-right w-24 sm:w-32">Amount (Rs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white font-medium">
              {suits.map((suit, suitIdx) => {
                const suitCustoms = suit.customizations || [];
                const baseRate = Number(suit.basePrice || 0);

                return (
                  <React.Fragment key={`suit-${suitIdx}`}>
                    {/* Suit Base Garment Row */}
                    <tr className="hover:bg-gray-50 transition bg-white">
                      <td className="py-2.5 px-2.5 sm:px-3">
                        <div className="font-bold text-gray-900 text-xs">
                          Suit #{suitIdx + 1}: {suit.serviceType || 'Garment'}
                        </div>
                        {suit.fabricDetails && (
                          <div className="text-[10px] text-gray-500">
                            Fabric: {suit.fabricDetails} {suit.volumeNo ? `(${suit.volumeNo})` : ''}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-gray-600 text-xs">1</td>
                      <td className="py-2.5 px-2.5 sm:px-3 text-right font-bold text-xs text-gray-900 font-sans">
                        Rs {baseRate.toLocaleString()}
                      </td>
                    </tr>

                    {/* Individual Customization Rows */}
                    {suitCustoms.map((cust, cIdx) => (
                      <tr key={`suit-${suitIdx}-cust-${cIdx}`} className="bg-amber-50/30">
                        <td className="py-2 px-2.5 sm:px-3 pl-4 sm:pl-6 text-[11px] text-gray-700 flex items-center gap-1">
                          <FiCornerDownRight className="text-amber-600 shrink-0" />
                          <span>Add-on: {cust.name}</span>
                        </td>
                        <td className="py-2 px-2 text-center text-[10px] text-gray-500">1</td>
                        <td className="py-2 px-2.5 sm:px-3 text-right font-bold text-[11px] text-gray-800 font-sans">
                          +Rs {Number(cust.price || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}

              {alterations.map((alt, idx) => (
                <tr key={`alt-${idx}`} className="hover:bg-gray-50 transition bg-white">
                  <td className="py-2.5 px-2.5 sm:px-3">
                    <span className="font-bold text-gray-800 text-xs">
                      Alteration: {alt.description || 'Alteration Work'}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold text-gray-600 text-xs">1</td>
                  <td className="py-2.5 px-2.5 sm:px-3 text-right font-bold text-xs text-gray-900 font-sans">
                    Rs {Number(alt.price || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-black text-xs border-t border-gray-200">
              <tr>
                <td colSpan="2" className="py-2.5 px-2.5 sm:px-3 text-right text-gray-600">Gross Subtotal:</td>
                <td className="py-2.5 px-2.5 sm:px-3 text-right text-xs sm:text-sm text-[#0F172A] font-sans font-black">
                  Rs {rawSubtotal.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryTable;
