import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';
import { AccountCircle, Logout, Storefront } from '@mui/icons-material';
import api from '../services/api.web';
import { DEFAULT_PROFILE_STATE, INDIAN_STATES_AND_UTS } from '../constants/locationOptions';

const EMPTY_LISTING_FORM = {
  title: '',
  crop: '',
  quantity: '',
  unit: 'kg',
  expectedPrice: '',
  city: '',
  state: DEFAULT_PROFILE_STATE,
  market: '',
  contactPhone: '',
  description: ''
};

const MarketplaceScreen = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'farmer');
  const [currentUserId, setCurrentUserId] = useState('');
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [myInterests, setMyInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [interestOpen, setInterestOpen] = useState(false);
  const [bargainOpen, setBargainOpen] = useState(false);
  const [activeListing, setActiveListing] = useState(null);
  const [activeInterestRef, setActiveInterestRef] = useState(null);
  const [listingForm, setListingForm] = useState(EMPTY_LISTING_FORM);
  const [interestForm, setInterestForm] = useState({
    message: '',
    offeredPrice: '',
    quantityRequested: ''
  });
  const [bargainForm, setBargainForm] = useState({
    amount: '',
    message: ''
  });
  const [cropFilter, setCropFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  const filteredListings = useMemo(() => {
    if (userRole !== 'customer' || !currentUserId) {
      return listings;
    }

    // Hide listings from browse tab if this customer already has an active/pending outcome
    // for that listing. Keep only listings where customer has no interaction (or rejected/cancelled).
    return listings.filter((listing) => {
      const myInterest = (listing.interests || []).find((interest) => {
        const buyerId = interest?.buyer?._id || interest?.buyer;
        return String(buyerId) === String(currentUserId);
      });

      if (!myInterest) return true;
      return ['rejected', 'cancelled'].includes(myInterest.status);
    });
  }, [listings, userRole, currentUserId]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (cropFilter.trim()) params.crop = cropFilter.trim();
      if (stateFilter.trim()) params.state = stateFilter.trim();
      if (cityFilter.trim()) params.city = cityFilter.trim();

      const response = await api.get('/marketplace/listings', { params });
      setListings(response.data?.data?.listings || []);
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to fetch marketplace listings');
    } finally {
      setLoading(false);
    }
  }, [cropFilter, stateFilter, cityFilter]);

  const fetchMyListings = useCallback(async () => {
    try {
      const response = await api.get('/marketplace/my-listings');
      setMyListings(response.data?.data?.listings || []);
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to fetch your listings');
    }
  }, []);

  const fetchMyInterests = useCallback(async () => {
    if (userRole !== 'customer') return;
    try {
      const response = await api.get('/marketplace/my-interests');
      setMyInterests(response.data?.data?.interests || []);
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to fetch your interactions');
    }
  }, [userRole]);

  const fetchProfileRole = useCallback(async () => {
    try {
      const response = await api.get('/auth/profile');
      const role = response.data?.data?.user?.role || 'farmer';
      const userId = response.data?.data?.user?.id || '';
      setUserRole(role);
      setCurrentUserId(userId);
      localStorage.setItem('userRole', role);
    } catch (err) {
      // keep local storage fallback
    }
  }, []);

  useEffect(() => {
    fetchProfileRole();
    fetchListings();
  }, [fetchListings, fetchProfileRole]);

  useEffect(() => {
    if (userRole === 'farmer') {
      fetchMyListings();
      setTab(0);
    } else {
      fetchMyInterests();
      setTab(0);
    }
  }, [userRole, fetchMyListings, fetchMyInterests]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (userRole === 'farmer') {
        fetchMyListings();
      } else {
        fetchMyInterests();
      }
      fetchListings();
    }, 10000);

    return () => clearInterval(timer);
  }, [userRole, fetchMyListings, fetchMyInterests, fetchListings]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'create' && userRole === 'farmer') {
      setCreateOpen(true);
    }
  }, [location.search, userRole]);

  const handleCreateListing = async () => {
    try {
      await api.post('/marketplace/listings', {
        ...listingForm,
        quantity: Number(listingForm.quantity),
        expectedPrice: Number(listingForm.expectedPrice)
      });
      setCreateOpen(false);
      setListingForm(EMPTY_LISTING_FORM);
      setTab(1);
      setSuccess('Listing created successfully');
      fetchListings();
      fetchMyListings();
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to create listing');
    }
  };

  const openInterestDialog = (listing) => {
    setActiveListing(listing);
    setInterestForm({
      message: '',
      offeredPrice: String(listing.expectedPrice || ''),
      quantityRequested: ''
    });
    setInterestOpen(true);
  };

  const handleSendInterest = async () => {
    if (!activeListing) return;
    try {
      await api.post(`/marketplace/listings/${activeListing._id}/interests`, {
        message: interestForm.message,
        offeredPrice: interestForm.offeredPrice ? Number(interestForm.offeredPrice) : undefined,
        quantityRequested: interestForm.quantityRequested ? Number(interestForm.quantityRequested) : undefined
      });
      setInterestOpen(false);
      setActiveListing(null);
      setSuccess('Interest sent to farmer successfully');
      fetchListings();
      fetchMyInterests();
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to send interest');
    }
  };

  const updateInterestStatus = async (listingId, interestId, status) => {
    try {
      await api.patch(`/marketplace/listings/${listingId}/interests/${interestId}`, { status });
      setSuccess(`Request ${status} successfully`);
      fetchMyListings();
      fetchListings();
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to update interest');
    }
  };

  const closeListing = async (listingId) => {
    try {
      await api.patch(`/marketplace/listings/${listingId}/close`);
      setSuccess('Listing closed successfully');
      fetchMyListings();
      fetchListings();
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to close listing');
    }
  };

  const openBargainDialog = (payload) => {
    setActiveInterestRef(payload);
    setBargainForm({
      amount: String(payload.currentOffer || payload.offeredPrice || ''),
      message: ''
    });
    setBargainOpen(true);
  };

  const handleRefresh = () => {
    fetchListings();
    if (userRole === 'farmer') {
      fetchMyListings();
    } else {
      fetchMyInterests();
    }
  };

  const handleBargainSubmit = async () => {
    if (!activeInterestRef?.listingId || !activeInterestRef?.interestId) return;
    try {
      await api.patch(
        `/marketplace/listings/${activeInterestRef.listingId}/interests/${activeInterestRef.interestId}/bargain`,
        {
          amount: Number(bargainForm.amount),
          message: bargainForm.message
        }
      );
      setBargainOpen(false);
      setSuccess('Bargain submitted successfully');
      fetchMyListings();
      fetchMyInterests();
      fetchListings();
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to submit bargain');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'transparent' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Storefront sx={{ mr: 2, fontSize: 30 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">{userRole === 'farmer' ? 'Farmer Marketplace Portal' : 'Customer Marketplace Portal'}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              {userRole === 'farmer'
                ? 'Create listings, manage interests, and negotiate with customers'
                : 'Browse listings, interact, and bargain with farmers'}
            </Typography>
          </Box>
          <Chip
            label={userRole === 'customer' ? 'Customer' : 'Farmer'}
            size="small"
            sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
          />
          <IconButton color="inherit" onClick={() => navigate('/profile')} aria-label="Profile">
            <AccountCircle />
          </IconButton>
          <Button color="inherit" startIcon={<Logout />} onClick={onLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        <Storefront sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
        Farmer-Consumer Marketplace
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Filter by crop"
          value={cropFilter}
          onChange={(e) => setCropFilter(e.target.value)}
          size="small"
        />
        <TextField
          select
          label="State"
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">All States</MenuItem>
          {INDIAN_STATES_AND_UTS.map((state) => (
            <MenuItem key={state} value={state}>{state}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="City"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          size="small"
        />
        <Button variant="outlined" onClick={handleRefresh}>Refresh</Button>
        {userRole === 'farmer' && (
          <Button variant="contained" onClick={() => setCreateOpen(true)}>Create Listing</Button>
        )}
      </Stack>

      {userRole === 'farmer' ? (
        <Tabs value={tab} onChange={(e, value) => setTab(value)} sx={{ mb: 2 }}>
          <Tab label="Browse Listings" />
          <Tab label="My Listings" />
        </Tabs>
      ) : (
        <Tabs value={tab} onChange={(e, value) => setTab(value)} sx={{ mb: 2 }}>
          <Tab label="Browse & Interact" />
          <Tab label="My Requests & Bargains" />
        </Tabs>
      )}

      {tab === 0 && (
        <Grid container spacing={2}>
          {filteredListings.map((listing) => (
            <Grid item xs={12} md={6} key={listing._id}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{listing.title}</Typography>
                    <Chip label={listing.status} color={listing.status === 'active' ? 'success' : 'default'} size="small" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Crop: {listing.crop} | Quantity: {listing.quantity} {listing.unit}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Expected Price: Rs {listing.expectedPrice}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Seller: {listing?.seller?.profile?.name || 'Unknown'} ({listing?.location?.city || listing?.location?.district || 'N/A'}, {listing?.location?.state || 'N/A'})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Contact: {listing?.contactPhone || listing?.seller?.profile?.phone || 'Not provided'}
                  </Typography>
                  {listing.description && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {listing.description}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={listing.status !== 'active' || userRole !== 'customer'}
                      onClick={() => openInterestDialog(listing)}
                    >
                      {userRole === 'customer' ? 'Send Interest' : 'Customers can send interest'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {!loading && filteredListings.length === 0 && (
            <Grid item xs={12}>
              <Alert severity="info">No listings found.</Alert>
            </Grid>
          )}
        </Grid>
      )}

      {tab === 1 && userRole === 'farmer' && (
        <Grid container spacing={2}>
          {myListings.map((listing) => (
            <Grid item xs={12} key={listing._id}>
              <Card>
                <CardContent>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                    <Box>
                      <Typography variant="h6">{listing.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {listing.crop} | {listing.quantity} {listing.unit} | Rs {listing.expectedPrice}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip label={listing.status} size="small" color={listing.status === 'active' ? 'success' : 'default'} />
                      {listing.status === 'active' && (
                        <Button size="small" color="warning" onClick={() => closeListing(listing._id)}>
                          Close
                        </Button>
                      )}
                    </Stack>
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Interest Requests ({listing.interests?.length || 0})</Typography>
                    {(listing.interests || []).map((interest) => (
                      <Card variant="outlined" key={interest._id} sx={{ mt: 1 }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography variant="body2">
                            Buyer: {interest?.buyer?.profile?.name || 'Unknown'} | Status: {interest.status}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Offered: {interest.offeredPrice || 'N/A'} | Current Bargain: {interest.currentOffer || 'N/A'} | Qty: {interest.quantityRequested || 'N/A'}
                          </Typography>
                          {interest.message && <Typography variant="body2">{interest.message}</Typography>}
                          {(interest.bargainHistory || []).length > 0 && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                              Bargain updates: {interest.bargainHistory.length}
                            </Typography>
                          )}
                          {interest.status === 'requested' && (
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                              <Button size="small" variant="contained" onClick={() => updateInterestStatus(listing._id, interest._id, 'accepted')}>
                                Accept
                              </Button>
                              <Button size="small" variant="outlined" color="error" onClick={() => updateInterestStatus(listing._id, interest._id, 'rejected')}>
                                Reject
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => openBargainDialog({
                                  listingId: listing._id,
                                  interestId: interest._id,
                                  currentOffer: interest.currentOffer || interest.offeredPrice
                                })}
                              >
                                Counter Bargain
                              </Button>
                            </Stack>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {myListings.length === 0 && (
            <Grid item xs={12}>
              <Alert severity="info">You have not created any listings yet.</Alert>
            </Grid>
          )}
        </Grid>
      )}

      {tab === 1 && userRole === 'customer' && (
        <Grid container spacing={2}>
          {myInterests.map((entry) => (
            <Grid item xs={12} key={`${entry.listingId}-${entry.interest._id}`}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{entry.listingTitle}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Crop: {entry.crop} | Seller: {entry?.seller?.profile?.name || 'Unknown'} | Listing: {entry.listingStatus}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Request Status: {entry.interest.status} | Current Offer: Rs {entry.interest.currentOffer || entry.interest.offeredPrice || 'N/A'}
                  </Typography>
                  {(entry.interest.bargainHistory || []).length > 0 && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Bargain trail: {entry.interest.bargainHistory.map((item) => `${item.byRole}: Rs ${item.amount}`).join(' -> ')}
                    </Typography>
                  )}
                  {entry.interest.status === 'requested' && (
                    <Button
                      sx={{ mt: 1.5 }}
                      variant="outlined"
                      onClick={() => openBargainDialog({
                        listingId: entry.listingId,
                        interestId: entry.interest._id,
                        currentOffer: entry.interest.currentOffer || entry.interest.offeredPrice
                      })}
                    >
                      Bargain / Counter Offer
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
          {myInterests.length === 0 && (
            <Grid item xs={12}>
              <Alert severity="info">No interaction requests yet. Browse listings and send interest.</Alert>
            </Grid>
          )}
        </Grid>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Marketplace Listing</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={listingForm.title} onChange={(e) => setListingForm((prev) => ({ ...prev, title: e.target.value }))} />
            <TextField label="Crop" value={listingForm.crop} onChange={(e) => setListingForm((prev) => ({ ...prev, crop: e.target.value }))} />
            <Stack direction="row" spacing={2}>
              <TextField label="Quantity" type="number" value={listingForm.quantity} onChange={(e) => setListingForm((prev) => ({ ...prev, quantity: e.target.value }))} />
              <TextField select label="Unit" value={listingForm.unit} onChange={(e) => setListingForm((prev) => ({ ...prev, unit: e.target.value }))}>
                <MenuItem value="kg">kg</MenuItem>
                <MenuItem value="quintal">quintal</MenuItem>
                <MenuItem value="ton">ton</MenuItem>
              </TextField>
            </Stack>
            <TextField label="Expected Price (Rs)" type="number" value={listingForm.expectedPrice} onChange={(e) => setListingForm((prev) => ({ ...prev, expectedPrice: e.target.value }))} />
            <Stack direction="row" spacing={2}>
              <TextField label="City" value={listingForm.city} onChange={(e) => setListingForm((prev) => ({ ...prev, city: e.target.value }))} />
              <TextField
                select
                label="State"
                value={listingForm.state}
                onChange={(e) => setListingForm((prev) => ({ ...prev, state: e.target.value }))}
                sx={{ minWidth: 220 }}
              >
                {INDIAN_STATES_AND_UTS.map((state) => (
                  <MenuItem key={state} value={state}>{state}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField label="Market (optional)" value={listingForm.market} onChange={(e) => setListingForm((prev) => ({ ...prev, market: e.target.value }))} />
            <TextField label="Contact Phone" value={listingForm.contactPhone} onChange={(e) => setListingForm((prev) => ({ ...prev, contactPhone: e.target.value }))} />
            <TextField label="Description" multiline minRows={3} value={listingForm.description} onChange={(e) => setListingForm((prev) => ({ ...prev, description: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateListing}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={interestOpen} onClose={() => setInterestOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Send Interest</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Message" multiline minRows={3} value={interestForm.message} onChange={(e) => setInterestForm((prev) => ({ ...prev, message: e.target.value }))} />
            <TextField label="Offered Price (Rs)" type="number" value={interestForm.offeredPrice} onChange={(e) => setInterestForm((prev) => ({ ...prev, offeredPrice: e.target.value }))} />
            <TextField label="Quantity Requested" type="number" value={interestForm.quantityRequested} onChange={(e) => setInterestForm((prev) => ({ ...prev, quantityRequested: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInterestOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSendInterest}>Send</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bargainOpen} onClose={() => setBargainOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Submit Bargain Offer</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="New Offer Amount (Rs)"
              type="number"
              value={bargainForm.amount}
              onChange={(e) => setBargainForm((prev) => ({ ...prev, amount: e.target.value }))}
            />
            <TextField
              label="Message (optional)"
              multiline
              minRows={3}
              value={bargainForm.message}
              onChange={(e) => setBargainForm((prev) => ({ ...prev, message: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBargainOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBargainSubmit}>Submit Bargain</Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default MarketplaceScreen;
