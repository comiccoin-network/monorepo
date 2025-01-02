import React, { useState } from "react";
import { Plus, Minus, X } from "lucide-react";

const DISPLAY_TYPE_OPTIONS = [
  { value: "", label: "Please select" },
  { value: "boost_number", label: "Boost Number" },
  { value: "boost_percentage", label: "Boost Percentage" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "string", label: "String" },
];

const FormTokenMetadataAttributesField = ({
  data = [],
  onDataChange = null,
  disabled = false,
  helpText = "",
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    displayType: "",
    traitType: "",
    value: "",
  });

  const resetForm = () => {
    setFormData({
      displayType: "",
      traitType: "",
      value: "",
    });
    setErrors({});
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleSubmit = () => {
    const newErrors = {};
    if (!formData.displayType)
      newErrors.displayType = "Display type is required";
    if (!formData.traitType) newErrors.traitType = "Trait type is required";
    if (!formData.value) newErrors.value = "Value is required";

    if (Object.keys(newErrors).length === 0) {
      const updatedData = [
        ...data,
        {
          display_type: formData.displayType,
          trait_type: formData.traitType,
          value: formData.value,
        },
      ];
      onDataChange(updatedData);
      handleModalClose();
    } else {
      setErrors(newErrors);
    }
  };

  const handleRemoveAttribute = (index) => {
    const updatedData = [...data];
    updatedData.splice(index, 1);
    onDataChange(updatedData);
  };

  return (
    <>
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="relative z-50 w-full max-w-lg bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">
                Add Token Metadata Attribute
              </h3>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Type *
                </label>
                <select
                  value={formData.displayType}
                  onChange={(e) =>
                    setFormData({ ...formData, displayType: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.displayType ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  {DISPLAY_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.displayType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.displayType}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trait Type *
                </label>
                <input
                  type="text"
                  value={formData.traitType}
                  onChange={(e) =>
                    setFormData({ ...formData, traitType: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.traitType ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter trait type"
                />
                {errors.traitType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.traitType}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value *
                </label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.value ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter value"
                />
                {errors.value && (
                  <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t rounded-b-lg">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pb-4">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Attributes (Optional)
        </label>

        {data && data.length > 0 ? (
          <div className="mb-4 overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Display Type</th>
                  <th className="px-6 py-3">Trait Type</th>
                  <th className="px-6 py-3">Value</th>
                  {!disabled && (
                    <th className="px-6 py-3">
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center px-3 py-1.5 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </button>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((datum, index) => (
                  <tr key={index} className="text-sm text-gray-900">
                    <td className="px-6 py-4">{datum.display_type || "-"}</td>
                    <td className="px-6 py-4">{datum.trait_type}</td>
                    <td className="px-6 py-4">{datum.value}</td>
                    {!disabled && (
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleRemoveAttribute(index)}
                          className="inline-flex items-center px-3 py-1.5 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
                        >
                          <Minus className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <button
            onClick={() => setShowAddModal(true)}
            disabled={disabled}
            className="inline-flex items-center px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Attribute
          </button>
        )}
        {helpText && <p className="mt-2 text-sm text-gray-500">{helpText}</p>}
      </div>
    </>
  );
};

export default FormTokenMetadataAttributesField;
