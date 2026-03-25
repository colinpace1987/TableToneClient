import React from "react";

export default function Privacy() {
  return (
    <div className="card legal">
      <h2>Privacy</h2>
      <p>
        TableTone is designed to work without accounts or location permissions.
        We collect minimal data to operate the service.
      </p>
      <h3>What we collect</h3>
      <ul>
        <li>Ratings and optional notes/photos you submit</li>
        <li>Basic technical data (IP address and user agent) to limit abuse</li>
      </ul>
      <h3>How we use it</h3>
      <ul>
        <li>To display community ratings and photos</li>
        <li>To prevent spam and abuse</li>
      </ul>
      <h3>Data retention</h3>
      <p>
        We retain user submissions unless they are removed or flagged for abuse.
        You can request removal by contacting the app owner.
      </p>
    </div>
  );
}
