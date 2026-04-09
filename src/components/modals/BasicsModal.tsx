import { useState } from 'react'
import type { Basics } from '../../types/resume'

interface BasicsModalProps {
  initialValue: Basics
  onCancel: () => void
  onSave: (nextValue: Basics) => void
}

export function BasicsModal({
  initialValue,
  onCancel,
  onSave,
}: BasicsModalProps) {
  const [draft, setDraft] = useState<Basics>(initialValue)

  const updateField = (
    key: Exclude<keyof Basics, 'location' | 'profiles'>,
    value: string,
  ) => {
    setDraft((previous) => ({
      ...previous,
      [key]: value,
    }))
  }

  const updateLocationField = (key: keyof Basics['location'], value: string) => {
    setDraft((previous) => ({
      ...previous,
      location: {
        ...previous.location,
        [key]: value,
      },
    }))
  }

  const updateProfileField = (
    index: number,
    key: keyof Basics['profiles'][number],
    value: string,
  ) => {
    setDraft((previous) => ({
      ...previous,
      profiles: previous.profiles.map((profile, profileIndex) =>
        profileIndex === index ? { ...profile, [key]: value } : profile,
      ),
    }))
  }

  const addProfile = () => {
    setDraft((previous) => ({
      ...previous,
      profiles: [...previous.profiles, { network: '', username: '', url: '' }],
    }))
  }

  const deleteProfile = (index: number) => {
    setDraft((previous) => ({
      ...previous,
      profiles: previous.profiles.filter((_, profileIndex) => profileIndex !== index),
    }))
  }

  const save = () => onSave(draft)

  return (
    <div className="modal-overlay" role="presentation" onClick={onCancel}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Edit basics"
        onClick={(event) => event.stopPropagation()}
      >
        <h3>Edit basics</h3>
        <div className="modal-grid">
          <label>
            Name
            <input
              value={draft.name}
              onChange={(event) => updateField('name', event.target.value)}
            />
          </label>
          <label>
            Label
            <input
              value={draft.label}
              onChange={(event) => updateField('label', event.target.value)}
            />
          </label>
          <label>
            Image
            <input
              value={draft.image}
              onChange={(event) => updateField('image', event.target.value)}
            />
          </label>
          <label>
            Email
            <input
              value={draft.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </label>
          <label>
            Phone
            <input
              value={draft.phone}
              onChange={(event) => updateField('phone', event.target.value)}
            />
          </label>
          <label>
            URL
            <input
              value={draft.url}
              onChange={(event) => updateField('url', event.target.value)}
            />
          </label>
          <label className="full-row">
            Summary
            <textarea
              rows={4}
              value={draft.summary}
              onChange={(event) => updateField('summary', event.target.value)}
            />
          </label>
          <label>
            Address
            <input
              value={draft.location.address}
              onChange={(event) =>
                updateLocationField('address', event.target.value)
              }
            />
          </label>
          <label>
            Postal code
            <input
              value={draft.location.postalCode}
              onChange={(event) =>
                updateLocationField('postalCode', event.target.value)
              }
            />
          </label>
          <label>
            City
            <input
              value={draft.location.city}
              onChange={(event) => updateLocationField('city', event.target.value)}
            />
          </label>
          <label>
            Country code
            <input
              value={draft.location.countryCode}
              onChange={(event) =>
                updateLocationField('countryCode', event.target.value)
              }
            />
          </label>
          <label>
            Region
            <input
              value={draft.location.region}
              onChange={(event) => updateLocationField('region', event.target.value)}
            />
          </label>
          <div className="full-row">
            <span>Profiles</span>
            {draft.profiles.length > 0 ? (
              draft.profiles.map((profile, index) => (
                <div key={`profile-${index}`} className="profile-group">
                  <div className="modal-grid">
                    <label>
                      Network
                      <input
                        value={profile.network}
                        onChange={(event) =>
                          updateProfileField(index, 'network', event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Username
                      <input
                        value={profile.username}
                        onChange={(event) =>
                          updateProfileField(index, 'username', event.target.value)
                        }
                      />
                    </label>
                    <label className="full-row">
                      URL
                      <input
                        value={profile.url}
                        onChange={(event) =>
                          updateProfileField(index, 'url', event.target.value)
                        }
                      />
                    </label>
                  </div>
                  <button type="button" onClick={() => deleteProfile(index)}>
                    Delete profile
                  </button>
                </div>
              ))
            ) : (
              <p className="section-empty">No profiles yet.</p>
            )}
            <button type="button" className="add-highlight-button" onClick={addProfile}>
              Add profile
            </button>
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
