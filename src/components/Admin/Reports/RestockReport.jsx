import React, { useContext, useEffect, useMemo, useState } from "react";
import RestockReportTable from "./RestockReportTable";
import SupplierSelect from "../Books/SupplierSelect";
import { BookContext } from "../Books/Book";
import axios from "axios";
import { useQuery } from "react-query";
import LoadingScreen from "../../Loading/LoadingScreen";
import RangePicker from "./RangePicker";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const RestockReport = () => {
  const { supplier } = useContext(BookContext);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rows, setRows] = useState([]);
  const [type, setType] = useState("");
  const [footerData, setFooterData] = useState({});

  const url = useMemo(() => {
    return `/stock/restockreport?supplier_name=${supplier?.supplier_name}&supplier_percent=${supplier?.percent}&start=${startDate}&end=${endDate}&type=${type}`;
  }, [supplier, startDate, endDate, type]);
  const fetchMyData = async () => {
    const res = await axios.get(import.meta.env.VITE_API_BASEURL + url);
    return res.data;
  };

  const { isLoading, data } = useQuery(
    ["restock report", supplier, startDate, endDate, type],
    fetchMyData,
    {
      enabled: !!supplier && !!startDate && !!endDate && !!type,
    }
  );

  useEffect(() => {
    if (data) {
      let totalQuantity = 0;
      let totalPrice = 0;
      let totalNet = 0;
      const newRows = [];
      Object.keys(data).map((id, i) => {
        const item = data[id];
        totalQuantity += item.restock.total_quantity;
        totalPrice += item.restock.total_price;
        totalNet += item.restock.total_net;
        newRows.push({
          id: i + 1,
          show_id: i + 1,
          restock_id: item.restock.restock_id,
          date: item.restock.date,
          ref_id: item.restock.ref_id,
          quantity: item.restock.total_quantity,
          price: item.restock.total_price,
          net: item.restock.total_net,
          details: item.restock_details,
        });
      });
      setFooterData({
        totalQuantity,
        totalPrice: totalPrice.toFixed(2),
        totalNet: totalNet.toFixed(2),
      });
      setRows(newRows);
    }
  }, [data]);

  if (isLoading) return <LoadingScreen />;
  return (
    <div className="flex flex-col items-center">
      <div className="mb-5 w-fit items-center">
        <div className="w-full flex gap-10 items-end">
          <div className="w-1/2">
            <SupplierSelect />
          </div>
          <RangePicker
            start={startDate}
            end={endDate}
            onStartChange={(date) => setStartDate(date)}
            onEndChange={(date) => setEndDate(date)}
          />
        </div>
      </div>
      <div className="flex mt-16">
        <div className="mr-20">
          <button
            onClick={() => setType("order")}
            className={`flex justify-center items-center gap-1 text-blue-500 p-2 rounded-lg h-12 transition-all ${
              type === "order" ? "bg-gray-200" : "hover:bg-gray-200"
            }`}
          >
            สั่งสินค้า
          </button>
          <button
            onClick={() => setType("add")}
            className={`flex justify-center items-center gap-1 text-blue-500 p-2 rounded-lg h-12 transition-all ${
              type === "add" ? "bg-gray-200" : "hover:bg-gray-200"
            }`}
          >
            รับสินค้า
          </button>
          <button
            onClick={() => setType("return")}
            className={`flex justify-center items-center gap-1 text-blue-500 p-2 rounded-lg h-12 transition-all ${
              type === "return" ? "bg-gray-200" : "hover:bg-gray-200"
            }`}
          >
            คืนสินค้า
          </button>
        </div>
        {rows && (
          <RestockReportTable
            rows={rows}
            type={type}
            footerData={footerData}
            supplier={supplier}
          />
        )}
      </div>
    </div>
  );
};

export default RestockReport;
