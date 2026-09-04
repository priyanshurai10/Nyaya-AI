import re

path = 'backend/app/api/v1/navigation.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# I want to completely remove the bad block that was injected by powershell Add-Content
# The bad block starts at @router.get(""/hierarchy/courts"")

bad_start = content.find('@router.get(""/hierarchy/courts"")')
if bad_start != -1:
    # We want to remove from bad_start to the end of that bad array.
    # Actually, if I just replace "" with " it might fix it?
    pass

# A safer bet: just replace all double-double quotes with single double quotes, BUT that might break actual code that uses empty strings ""!
# Instead, let's find the exact bad block.
bad_block = """@router.get(""/hierarchy/courts"")
def get_court_hierarchy():
    return [
        {
            ""id"": ""sc"",
            ""level"": ""Apex Court"",
            ""name"": ""Supreme Court of India"",
            ""description"": ""The highest judicial court and the final court of appeal under the Constitution of India."",
            ""jurisdiction"": ""Original, Appellate & Advisory"",
            ""location"": ""New Delhi""
        },
        {
            ""id"": ""hc"",
            ""level"": ""State Level"",
            ""name"": ""High Courts"",
            ""description"": ""The principal civil courts of original jurisdiction in each state and union territory."",
            ""jurisdiction"": ""State-wide Appellate & Writ"",
            ""location"": ""State Capitals""
        },
        {
            ""id"": ""dc"",
            ""level"": ""District Level"",
            ""name"": ""District & Sessions Courts"",
            ""description"": ""Deals with civil and criminal matters at the district level across India."",
            ""jurisdiction"": ""District-wide Original"",
            ""location"": ""All Districts""
        },
        {
            ""id"": ""sub"",
            ""level"": ""Subordinate"",
            ""name"": ""Subordinate Courts (Munsif / Magistrate)"",
            ""description"": ""Lower courts dealing with civil and criminal cases of lower valuation and lesser offences."",
            ""jurisdiction"": ""Taluka/Tehsil Level"",
            ""location"": ""Local Jurisdictions""
        }
    ]"""

new_content = content.replace(bad_block, "")
with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)
