import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import "./index.css";
import Dashboard from "./pages/home/dashboard";
import DataTablePage from "./pages/home/data-table";
import LogisticRegressionPage from "./pages/classification/logistic-regression";
import RandomForestClassifierPage from "./pages/classification/random-forest-classifier";
import LinearRegressionPage from "./pages/regression/linear-regression";
import XGBoostRegressionPage from "./pages/regression/xg-boost-regression";
import DecisionTreeRegressorPage from "./pages/regression/decision-tree-regressor";
import RandomForestRegressorPage from "./pages/regression/random-forest-regressor";
import KNNPage from "./pages/classification/knn";
import NaiveBayesPage from "./pages/classification/naive-bayes";
import XGBoostClassifierPage from "./pages/classification/xg-boost-classifier";
import LDAPage from "./pages/classification/lda-classifier";
import AnalysisPage from "./pages/home/analysis";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="/data-table" element={<DataTablePage />} />
          <Route path="/analysis" element={<AnalysisPage />} />

          <Route path="/classification/knn" element={<KNNPage />} />
          <Route path="/classification/lda-classifier" element={<LDAPage />} />
          <Route path="/classification/logistic-regression" element={<LogisticRegressionPage />} />
          <Route path="/classification/random-forest-classifier" element={<RandomForestClassifierPage />} />
          <Route path="/classification/naive-bayes" element={<NaiveBayesPage />} />
          <Route path="/classification/xg-boost-classifier" element={<XGBoostClassifierPage />} />

          <Route path="/regression/linear-regression" element={<LinearRegressionPage />} />
          <Route path="/regression/xg-boost-regressor" element={<XGBoostRegressionPage />} />
          <Route path="/regression/decision-tree-regressor" element={<DecisionTreeRegressorPage />} />
          <Route path="/regression/random-forest-regressor" element={<RandomForestRegressorPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
