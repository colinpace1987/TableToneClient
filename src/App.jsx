import React, { useEffect, useMemo, useState } from "react";
import {
  createEstablishment,
  fetchEstablishments,
  fetchRecentPhotos,
  submitFlag,
  submitProblemReport,
  submitRating,
} from "./api.js";
import Terms from "./pages/Terms.jsx";
import Privacy from "./pages/Privacy.jsx";

const CRITERIA = [
  { key: "lighting", label: "Lighting" },
  { key: "acoustics", label: "Acoustics" },
  { key: "tableDensity", label: "Density of Tables" },
  { key: "roadNoise", label: "Road Noise" },
  { key: "seatingComfort", label: "Comfort of Seating" },
];

const emptyScores = CRITERIA.reduce((acc, c) => ({ ...acc, [c.key]: 3 }), {});

export default function App() {
  const [step, setStep] = useState("zip");
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [scores, setScores] = useState(emptyScores);
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(null);
  const [establishments, setEstablishments] = useState([]);
  const [placeName, setPlaceName] = useState("");
  const [placeAddress, setPlaceAddress] = useState("");
  const [placeCity, setPlaceCity] = useState("");
  const [placeState, setPlaceState] = useState("");
  const [recentPhotos, setRecentPhotos] = useState([]);
  const [flaggingId, setFlaggingId] = useState(null);
  const [flagReason, setFlagReason] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [reportType, setReportType] = useState("Bug");
  const [reportMessage, setReportMessage] = useState("");
  const [reportEmail, setReportEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return selected && Object.values(scores).every(Boolean) && consent;
  }, [selected, scores, consent]);

  const handleFind = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await fetchEstablishments(zip);
      setEstablishments(data.establishments || []);
      setStep("list");
    } catch (err) {
      setError(err.message || "Failed to load places");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlace = async (e) => {
    e.preventDefault();
    setError("");
    if (!placeName.trim()) {
      setError("Place name is required");
      return;
    }
    setLoading(true);
    try {
      const data = await createEstablishment({
        name: placeName.trim(),
        address: placeAddress.trim(),
        city: placeCity.trim(),
        state: placeState.trim(),
        zip: zip.trim(),
      });
      setEstablishments((prev) => [data.establishment, ...prev]);
      setSelected(data.establishment);
      setStep("rate");
    } catch (err) {
      setError(err.message || "Failed to create place");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPhotos = async () => {
      if (!selected) return;
      try {
        const data = await fetchRecentPhotos(selected.id);
        setRecentPhotos(data.photos || []);
      } catch {
        setRecentPhotos([]);
      }
    };
    if (step === "rate" && selected) {
      loadPhotos();
    }
  }, [step, selected]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    try {
      await submitRating({
        establishmentId: selected.id,
        ...scores,
        note,
        photo,
      });
      try {
        const data = await fetchRecentPhotos(selected.id);
        setRecentPhotos(data.photos || []);
      } catch {
        // ignore
      }
      setStep("done");
    } catch (err) {
      setError(err.message || "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFlag = async (e) => {
    e.preventDefault();
    if (!flaggingId || !flagReason.trim()) return;
    try {
      await submitFlag({ ratingId: flaggingId, reason: flagReason.trim() });
      setFlaggingId(null);
      setFlagReason("");
    } catch (err) {
      setError(err.message || "Failed to submit flag");
    }
  };

  const handleReset = () => {
    setStep("zip");
    setZip("");
    setSelected(null);
    setScores(emptyScores);
    setNote("");
    setPhoto(null);
    setEstablishments([]);
    setPlaceName("");
    setPlaceAddress("");
    setPlaceCity("");
    setPlaceState("");
    setRecentPhotos([]);
    setFlaggingId(null);
    setFlagReason("");
    setShowReport(false);
    setReportType("Bug");
    setReportMessage("");
    setReportEmail("");
    setError("");
    setConsent(false);
  };

  const handleSubmitProblem = async (e) => {
    e.preventDefault();
    if (!reportMessage.trim()) return;
    try {
      await submitProblemReport({
        type: reportType,
        message: reportMessage.trim(),
        email: reportEmail.trim(),
        establishmentId: selected?.id || null,
      });
      setShowReport(false);
      setReportMessage("");
      setReportEmail("");
      setReportType("Bug");
    } catch (err) {
      setError(err.message || "Failed to submit report");
    }
  };

  return (
    <div className="page">
      <div className="top-bar">
        <button className="button ghost" onClick={handleReset}>
          Home
        </button>
      </div>
      <header className="header">
        <h1>TableTone</h1>
        <p>Rate the feel of a place — no login, no location.</p>
      </header>

      <div className="legal-links">
        <button className="link-button" onClick={() => setStep("terms")}>
          Terms
        </button>
        <button className="link-button" onClick={() => setStep("privacy")}>
          Privacy
        </button>
        <button className="link-button" onClick={() => setShowReport(true)}>
          Report a problem
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {step === "terms" && <Terms />}

      {step === "privacy" && <Privacy />}

      {showReport && (
        <div className="flag-modal">
          <div className="flag-card">
            <div className="flag-title">Report a problem</div>
            <form onSubmit={handleSubmitProblem}>
              <label className="label">
                Type
                <select
                  className="input"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option>Bug</option>
                  <option>Inappropriate post</option>
                  <option>Content issue</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="label">
                What happened?
                <textarea
                  className="textarea"
                  value={reportMessage}
                  onChange={(e) => setReportMessage(e.target.value)}
                  placeholder="Describe the issue..."
                  rows={4}
                />
              </label>
              {selected && (
                <div className="muted">
                  Reporting place: <strong>{selected.name}</strong>
                </div>
              )}
              <label className="label">
                Email (optional)
                <input
                  className="input"
                  value={reportEmail}
                  onChange={(e) => setReportEmail(e.target.value)}
                  placeholder="you@email.com"
                />
              </label>
              <div className="actions">
                <button className="button" type="submit">
                  Submit
                </button>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => setShowReport(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {step === "zip" && (
        <form className="card" onSubmit={handleFind}>
          <label className="label">
            Enter a ZIP code
            <input
              className="input"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="e.g. 60601"
              maxLength={10}
            />
          </label>
          <button className="button" disabled={!zip || loading}>
            {loading ? "Searching..." : "Find places"}
          </button>
        </form>
      )}

      {step === "list" && (
        <div className="card">
          <h2>Places in {zip}</h2>
          {establishments.length === 0 ? (
            <p className="muted">No places yet. Add the first one.</p>
          ) : (
            <ul className="list">
              {establishments.map((place) => (
                <li key={place.id}>
                  <button
                    className="list-item"
                    onClick={() => {
                      setSelected(place);
                      setStep("rate");
                    }}
                  >
                    <div className="title-row">
                      <div className="title">{place.name}</div>
                      <div className="rating-pill">
                        {place.avg_overall ? place.avg_overall : "—"}{" "}
                        <span className="rating-count">
                          {place.rating_count ? `(${place.rating_count})` : ""}
                        </span>
                      </div>
                    </div>
                    <div className="subtitle">
                      {place.address || [place.city, place.state].filter(Boolean).join(", ") || "No address"}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="actions">
            <button className="button" onClick={() => setStep("place")}>
              Add a place
            </button>
            <button className="button ghost" onClick={handleReset}>
              Change ZIP
            </button>
          </div>
        </div>
      )}

      {step === "place" && (
        <form className="card" onSubmit={handleCreatePlace}>
          <h2>Add a place in {zip}</h2>
          <label className="label">
            Place name
            <input
              className="input"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="e.g. Morning Roast Cafe"
            />
          </label>
          <label className="label">
            Address (optional)
            <input
              className="input"
              value={placeAddress}
              onChange={(e) => setPlaceAddress(e.target.value)}
              placeholder="123 Main St"
            />
          </label>
          <div className="row">
            <label className="label">
              City (optional)
              <input
                className="input"
                value={placeCity}
                onChange={(e) => setPlaceCity(e.target.value)}
                placeholder="Chicago"
              />
            </label>
            <label className="label">
              State (optional)
              <input
                className="input"
                value={placeState}
                onChange={(e) => setPlaceState(e.target.value)}
                placeholder="IL"
              />
            </label>
          </div>
          <label className="label">
            ZIP
            <input
              className="input"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="60601"
              maxLength={10}
            />
          </label>
          <div className="actions">
            <button className="button" disabled={loading}>
              {loading ? "Saving..." : "Continue to ratings"}
            </button>
            <button className="button ghost" type="button" onClick={handleReset}>
              Change ZIP
            </button>
          </div>
        </form>
      )}

      {step === "rate" && selected && (
        <form className="card" onSubmit={handleSubmit}>
          <div className="rate-header">
            <h2>Rate {selected.name}</h2>
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setReportType("Inappropriate post");
                setShowReport(true);
              }}
            >
              Report this place
            </button>
          </div>
          <div className="criteria">
            {CRITERIA.map((c) => (
              <div className="criterion" key={c.key}>
                <div className="criterion-label">{c.label}</div>
                <div className="scale">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      className={scores[c.key] === n ? "pill active" : "pill"}
                      onClick={() => setScores((s) => ({ ...s, [c.key]: n }))}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <label className="label">
            Optional note
            <textarea
              className="textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any context?"
              rows={3}
            />
          </label>

          <label className="label">
            Optional photo
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            />
          </label>

          <div className="photo-panel">
            <div className="photo-panel-title">Recent photos</div>
            {recentPhotos.length === 0 ? (
              <div className="muted">No photos yet.</div>
            ) : (
              <div className="photo-grid">
                {recentPhotos.map((p) => (
                  <div key={p.id} className="photo-card">
                    <img
                      className="photo-thumb"
                      src={`http://localhost:4000${p.photo_path}`}
                      alt="Recent upload"
                    />
                    <button
                      type="button"
                      className="link-button flag-button"
                      onClick={() => setFlaggingId(p.id)}
                    >
                      Report
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {flaggingId && (
            <div className="flag-modal">
              <div className="flag-card">
                <div className="flag-title">Report photo</div>
                <form onSubmit={handleSubmitFlag}>
                  <textarea
                    className="textarea"
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    placeholder="Why is this content problematic?"
                    rows={3}
                  />
                  <div className="actions">
                    <button className="button" type="submit">
                      Submit report
                    </button>
                    <button
                      className="button ghost"
                      type="button"
                      onClick={() => {
                        setFlaggingId(null);
                        setFlagReason("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <label className="checkbox">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              I confirm this is my honest experience and I have rights to any photos I upload.
            </span>
          </label>

          <div className="actions">
            <button className="button" disabled={!canSubmit || loading}>
              {loading ? "Submitting..." : "Submit rating"}
            </button>
            <button className="button ghost" type="button" onClick={handleReset}>
              Start over
            </button>
          </div>
        </form>
      )}

      {step === "done" && (
        <div className="card">
          <h2>Thanks for contributing!</h2>
          <p className="muted">Your rating helps others find the right vibe.</p>
          <div className="actions">
            <button className="button" onClick={handleReset}>Rate another place</button>
          </div>
        </div>
      )}
    </div>
  );
}
