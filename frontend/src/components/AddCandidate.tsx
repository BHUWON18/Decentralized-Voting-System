import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from 'axios';
import '../styles/AddCandidate.css';

interface CandidateData {
   id?: number;  // Made optional as it's typically assigned by the server
   name: string;
   partyName: string;
}

interface AddCandidateProps {
    candidates: CandidateData[];
    setCandidates: React.Dispatch<React.SetStateAction<CandidateData[]>>;
    setshowAddCandidate: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AddCandidate({ candidates, setCandidates, setshowAddCandidate }: AddCandidateProps) {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<CandidateData>();
    
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState("");

    const onSubmit = async (data: CandidateData) => {
        setLoading(true);
        setMessage("");
        
        try {
            const response = await axios.post("http://localhost:5000/admin/addCandidate", data);
            console.log(response);
            
            if (response.status === 200) {
                setCandidates([...candidates, response.data.candidate]);
                alert("Candidate Added Successfully");
                setshowAddCandidate(false);
            }
        } catch (error: any) {
            console.error("Error adding candidate:", error);
            
            if (error.response) {
                if (error.response.status === 400) {
                    setMessage(error.response.data.message);
                } else if (error.response.status === 500) {
                    setMessage("Internal Server error");
                }
            } else {
                setMessage(error.message || "An error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="add-candidate-container">
            <div className="form-wrapper">
                <h2>Add Candidate</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label>Name</label>
                        <input 
                            {...register("name", { 
                                required: "Candidate name is required" 
                            })} 
                            className="form-input" 
                        />
                        {errors.name && <p className="error-message">{errors.name.message}</p>}
                    </div>
                    
                    <div className="form-group">
                        <label>Party Name</label>
                        <input 
                            {...register("partyName", { 
                                required: "Party name is required" 
                            })} 
                            className="form-input" 
                        />
                        {errors.partyName && <p className="error-message">{errors.partyName.message}</p>}
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className={`submit-button ${loading ? "disabled" : ""}`}
                    >
                        {loading ? "Adding..." : "Add"}
                    </button>
                    
                    {message && <p className="error-message">{message}</p>}
                </form>
            </div>
        </div>
    );
}