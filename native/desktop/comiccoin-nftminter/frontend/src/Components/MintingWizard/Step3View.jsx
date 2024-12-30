import React, { useState } from 'react';
import { Navigate } from "react-router-dom";
import { Upload, AlertCircle, XCircle, ChevronRight, ChevronLeft, MoreHorizontal, CheckCircle2 } from 'lucide-react';

function MintingWizardStep3View() {
    const [forceURL, setForceURL] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Form fields
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");
    const [animation, setAnimation] = useState("");
    const [youtubeURL, setYoutubeURL] = useState("");
    const [externalURL, setExternalURL] = useState("");
    const [backgroundColor, setBackgroundColor] = useState("#ffffff");

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setForceURL("/minting-wizard-fin");
        }, 1000);
    };

    if (forceURL !== "") {
        return <Navigate to={forceURL} />;
    }

    return (
        <div>
            STEP 3
        </div>
    );
}

export default MintingWizardStep3View;
